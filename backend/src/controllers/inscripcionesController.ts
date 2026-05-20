import { Request, Response } from 'express';
import prisma from '../utils/db';
import { CreateInscripcionDTO, UpdateInscripcionDTO, ApiResponse } from '../types';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'Error interno del servidor';
};

export const getInscripciones = async (req: Request, res: Response) => {
  try {
    const inscripciones = await prisma.inscripcion.findMany({
      include: {
        estudiante: true,
        sesion: { include: { nivel: true, profesor: true } },
        multas: true,
      },
      orderBy: { fecha_inscripcion: 'desc' },
    });

    res.json({ success: true, data: inscripciones } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const getInscripcionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { inscripcion_id: parseInt(id) },
      include: {
        estudiante: true,
        sesion: { include: { nivel: true, profesor: true, salon: true } },
        multas: true,
      },
    });

    if (!inscripcion) {
      return res.status(404).json({ success: false, error: 'Inscripción no encontrada' });
    }

    res.json({ success: true, data: inscripcion } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const createInscripcion = async (req: Request, res: Response) => {
  try {
    const { estudiante_id, sesion_id }: CreateInscripcionDTO = req.body;

    if (!estudiante_id || !sesion_id) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: estudiante_id, sesion_id',
      });
    }

    // Calls stored procedure that validates cupos and inserts atomically.
    const result = (await prisma.$queryRaw`
      SELECT inscribir_estudiante(${estudiante_id}, ${sesion_id}) AS inscripcion_id
    `) as Array<{ inscripcion_id: number }>;

    const inscripcionId = result?.[0]?.inscripcion_id;

    if (!inscripcionId) {
      return res.status(500).json({ success: false, error: 'Error al procesar inscripción' });
    }

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { inscripcion_id: inscripcionId },
      include: {
        estudiante: true,
        sesion: { include: { nivel: true, profesor: true, salon: true } },
        multas: true,
      },
    });

    res.status(201).json({
      success: true,
      data: inscripcion,
      message: 'Inscripción creada exitosamente',
    } as ApiResponse<any>);
  } catch (error) {
    res.status(400).json({ success: false, error: getErrorMessage(error) });
  }
};

export const updateInscripcionAsistencia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado_asistencia }: UpdateInscripcionDTO = req.body;

    if (!estado_asistencia) {
      return res.status(400).json({ success: false, error: 'Requerido: estado_asistencia' });
    }

    // This update triggers PostgreSQL trigger for multa generation when state is Faltó.
    const inscripcion = await prisma.inscripcion.update({
      where: { inscripcion_id: parseInt(id) },
      data: { estado_asistencia },
      include: {
        estudiante: true,
        sesion: { include: { nivel: true, profesor: true, salon: true } },
        multas: true,
      },
    });

    res.json({
      success: true,
      data: inscripcion,
      message: 'Asistencia actualizada. Si es Faltó, la multa se genera automáticamente.',
    } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const deleteInscripcion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Before deleting inscription, release one seat in the related session.
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { inscripcion_id: parseInt(id) },
    });

    if (!inscripcion) {
      return res.status(404).json({ success: false, error: 'Inscripción no encontrada' });
    }

    await prisma.sesion.update({
      where: { sesion_id: inscripcion.sesion_id },
      data: { cupos_disponibles: { increment: 1 } },
    });

    await prisma.inscripcion.delete({
      where: { inscripcion_id: parseInt(id) },
    });

    res.json({ success: true, message: 'Inscripción cancelada y cupo liberado' });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};