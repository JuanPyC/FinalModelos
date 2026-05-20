import { Request, Response } from 'express';
import prisma from '../utils/db';
import { CreateEstudianteDTO, ApiResponse } from '../types';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Error interno del servidor';
};

export const getEstudiantes = async (req: Request, res: Response) => {
  try {
    const estudiantes = await prisma.estudiante.findMany({
      include: { inscripciones: true, multas: true },
      orderBy: { nombre: 'asc' },
    });
    res.json({ success: true, data: estudiantes } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const getEstudianteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const estudiante = await prisma.estudiante.findUnique({
      where: { estudiante_id: parseInt(id) },
      include: {
        inscripciones: { include: { sesion: { include: { nivel: true, profesor: true } } } },
        multas: true,
      },
    });
    if (!estudiante) return res.status(404).json({ success: false, error: 'Estudiante no encontrado' });
    res.json({ success: true, data: estudiante } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const createEstudiante = async (req: Request, res: Response) => {
  try {
    const { nombre, email, telefono, fecha_nacimiento }: CreateEstudianteDTO = req.body;

    if (!nombre || !email || !fecha_nacimiento) {
      return res.status(400).json({ success: false, error: 'Campos requeridos: nombre, email, fecha_nacimiento' });
    }

    const estudiante = await prisma.estudiante.create({
      data: { nombre, email, telefono, fecha_nacimiento: new Date(fecha_nacimiento) },
    });
    res.status(201).json({ success: true, data: estudiante, message: 'Estudiante creado exitosamente' } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const updateEstudiante = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.fecha_nacimiento) {
      updateData.fecha_nacimiento = new Date(updateData.fecha_nacimiento);
    }
    const estudiante = await prisma.estudiante.update({
      where: { estudiante_id: parseInt(id) },
      data: updateData,
    });
    res.json({ success: true, data: estudiante, message: 'Estudiante actualizado' } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const deleteEstudiante = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.estudiante.delete({
      where: { estudiante_id: parseInt(id) },
    });
    res.json({ success: true, message: 'Estudiante eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const getEstudianteMultas = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const multas = await prisma.multa.findMany({
      where: { estudiante_id: parseInt(id) },
      include: { inscripcion: { include: { sesion: { include: { nivel: true, profesor: true } } } } },
      orderBy: { fecha_generacion: 'desc' },
    });
    res.json({ success: true, data: multas } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};
