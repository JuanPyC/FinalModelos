import { Request, Response } from 'express';
import prisma from '../utils/db';
import { CreateSesionDTO, ApiResponse } from '../types';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'Error interno del servidor';
};

export const getSesiones = async (req: Request, res: Response) => {
  try {
    const sesiones = await prisma.sesion.findMany({
      include: {
        nivel: true,
        profesor: true,
        salon: true,
        inscripciones: { include: { estudiante: true } },
      },
      orderBy: { fecha: 'asc' },
    });
    res.json({ success: true, data: sesiones } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const getSesionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sesion = await prisma.sesion.findUnique({
      where: { sesion_id: parseInt(id) },
      include: {
        nivel: true,
        profesor: true,
        salon: true,
        inscripciones: { include: { estudiante: true } },
      },
    });
    if (!sesion) return res.status(404).json({ success: false, error: 'Sesión no encontrada' });
    res.json({ success: true, data: sesion } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const createSesion = async (req: Request, res: Response) => {
  try {
    const { nivel_id, profesor_id, salon_id, fecha, hora_inicio, duracion_min, cupos_disponibles }: CreateSesionDTO = req.body;

    if (!nivel_id || !profesor_id || !salon_id || !fecha || !hora_inicio || !duracion_min || cupos_disponibles === undefined) {
      return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
    }

    const sesion = await prisma.sesion.create({
      data: {
        nivel_id,
        profesor_id,
        salon_id,
        fecha: new Date(fecha),
        hora_inicio,
        duracion_min,
        cupos_disponibles,
      },
      include: { nivel: true, profesor: true, salon: true },
    });
    res.status(201).json({ success: true, data: sesion, message: 'Sesión creada exitosamente' } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const updateSesion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.fecha) {
      updateData.fecha = new Date(updateData.fecha);
    }
    const sesion = await prisma.sesion.update({
      where: { sesion_id: parseInt(id) },
      data: updateData,
      include: { nivel: true, profesor: true, salon: true },
    });
    res.json({ success: true, data: sesion, message: 'Sesión actualizada' } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const deleteSesion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.sesion.delete({
      where: { sesion_id: parseInt(id) },
    });
    res.json({ success: true, message: 'Sesión eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};
