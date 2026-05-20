import { Request, Response } from 'express';
import prisma from '../utils/db';
import { CreateSalonDTO, ApiResponse } from '../types';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'Error interno del servidor';
};

export const getSalones = async (req: Request, res: Response) => {
  try {
    const salones = await prisma.salon.findMany({
      include: { sesiones: true },
      orderBy: { nombre: 'asc' },
    });
    res.json({ success: true, data: salones } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const getSalonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const salon = await prisma.salon.findUnique({
      where: { salon_id: parseInt(id) },
      include: { sesiones: { include: { nivel: true, profesor: true } } },
    });
    if (!salon) return res.status(404).json({ success: false, error: 'Salón no encontrado' });
    res.json({ success: true, data: salon } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const createSalon = async (req: Request, res: Response) => {
  try {
    const { nombre, capacidad, equipado }: CreateSalonDTO = req.body;
    
    if (!nombre || !capacidad) {
      return res.status(400).json({ success: false, error: 'Campos requeridos: nombre, capacidad' });
    }

    const salon = await prisma.salon.create({
      data: { nombre, capacidad, equipado: equipado ?? true },
    });
    res.status(201).json({ success: true, data: salon, message: 'Salón creado exitosamente' } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const updateSalon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const salon = await prisma.salon.update({
      where: { salon_id: parseInt(id) },
      data: req.body,
    });
    res.json({ success: true, data: salon, message: 'Salón actualizado' } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const deleteSalon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.salon.delete({
      where: { salon_id: parseInt(id) },
    });
    res.json({ success: true, message: 'Salón eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};
