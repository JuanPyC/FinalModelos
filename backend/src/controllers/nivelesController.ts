import { Request, Response } from 'express';
import prisma from '../utils/db';
import { CreateNivelDTO, ApiResponse } from '../types';

export const getNiveles = async (req: Request, res: Response) => {
  try {
    const niveles = await prisma.nivel.findMany({
      orderBy: { nombre: 'asc' },
    });
    res.json({ success: true, data: niveles } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getNivelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const nivel = await prisma.nivel.findUnique({
      where: { nivel_id: parseInt(id) },
      include: { sesiones: true },
    });
    if (!nivel) return res.status(404).json({ success: false, error: 'Nivel no encontrado' });
    res.json({ success: true, data: nivel } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createNivel = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, duracion_semanas, precio }: CreateNivelDTO = req.body;
    
    if (!nombre || !duracion_semanas || precio === undefined) {
      return res.status(400).json({ success: false, error: 'Campos requeridos: nombre, duracion_semanas, precio' });
    }

    const nivel = await prisma.nivel.create({
      data: { nombre, descripcion, duracion_semanas, precio },
    });
    res.status(201).json({ success: true, data: nivel, message: 'Nivel creado exitosamente' } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateNivel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const nivel = await prisma.nivel.update({
      where: { nivel_id: parseInt(id) },
      data: updateData,
    });
    res.json({ success: true, data: nivel, message: 'Nivel actualizado' } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteNivel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.nivel.delete({
      where: { nivel_id: parseInt(id) },
    });
    res.json({ success: true, message: 'Nivel eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
