import { Request, Response } from 'express';
import prisma from '../utils/db';
import { ApiResponse } from '../types';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'Error interno del servidor';
};

export const getMultas = async (req: Request, res: Response) => {
  try {
    const multas = await prisma.multa.findMany({
      include: { estudiante: true, inscripcion: { include: { sesion: { include: { nivel: true, profesor: true } } } } },
      orderBy: { fecha_generacion: 'desc' },
    });
    res.json({ success: true, data: multas } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const getMultaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const multa = await prisma.multa.findUnique({
      where: { multa_id: parseInt(id) },
      include: { estudiante: true, inscripcion: { include: { sesion: { include: { nivel: true, profesor: true } } } } },
    });
    if (!multa) return res.status(404).json({ success: false, error: 'Multa no encontrada' });
    res.json({ success: true, data: multa } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const getMultasPendientes = async (req: Request, res: Response) => {
  try {
    const multas = await prisma.multa.findMany({
      where: { estado_pago: 'PENDIENTE' },
      include: { estudiante: true },
      orderBy: { fecha_generacion: 'desc' },
    });
    res.json({ success: true, data: multas } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const markMultaPagada = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const multa = await prisma.multa.update({
      where: { multa_id: parseInt(id) },
      data: { estado_pago: 'PAGADA' },
      include: { estudiante: true },
    });

    await prisma.estudiante.update({
      where: { estudiante_id: multa.estudiante_id },
      data: { saldo_pendiente: { decrement: 10.0 } },
    });

    res.json({ success: true, data: multa, message: 'Multa marcada como pagada' } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};