import { Request, Response } from 'express';
import prisma from '../utils/db';
import { CreateProfesorDTO, ApiResponse } from '../types';

export const getProfesores = async (req: Request, res: Response) => {
  try {
    const profesores = await prisma.profesor.findMany({
      include: { sesiones: true },
      orderBy: { nombre: 'asc' },
    });
    res.json({ success: true, data: profesores } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProfesorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profesor = await prisma.profesor.findUnique({
      where: { profesor_id: parseInt(id) },
      include: { sesiones: { include: { nivel: true, salon: true } } },
    });
    if (!profesor) return res.status(404).json({ success: false, error: 'Profesor no encontrado' });
    res.json({ success: true, data: profesor } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createProfesor = async (req: Request, res: Response) => {
  try {
    const { nombre, email, telefono, especialidad }: CreateProfesorDTO = req.body;
    
    if (!nombre || !email || !especialidad) {
      return res.status(400).json({ success: false, error: 'Campos requeridos: nombre, email, especialidad' });
    }

    const profesor = await prisma.profesor.create({
      data: { nombre, email, telefono, especialidad },
    });
    res.status(201).json({ success: true, data: profesor, message: 'Profesor creado exitosamente' } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfesor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profesor = await prisma.profesor.update({
      where: { profesor_id: parseInt(id) },
      data: req.body,
    });
    res.json({ success: true, data: profesor, message: 'Profesor actualizado' } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteProfesor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.profesor.delete({
      where: { profesor_id: parseInt(id) },
    });
    res.json({ success: true, message: 'Profesor eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
