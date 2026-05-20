import { Request, Response } from 'express';
import prisma from '../utils/db';
import { CreateInscripcionDTO, UpdateInscripcionDTO, ApiResponse } from '../types';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Clean up Prisma Raw Query errors
    if (error.message.includes('Raw query failed')) {
      const match = error.message.match(/Message: `(.*?)`/);
      if (match && match[1]) return match[1];
    }
    return error.message;
  }
  return 'Error interno del servidor';
};

const VALID_ESTADOS = ['PROGRAMADA', 'ASISTIO', 'FALTO', 'CANCELADA'] as const;
type EstadoAsistenciaValido = typeof VALID_ESTADOS[number];

const toEstadoAsistenciaEnum = (estado: string): EstadoAsistenciaValido | null => {
  const estadoMap: Record<string, EstadoAsistenciaValido> = {
    Programada: 'PROGRAMADA',
    'Asistió': 'ASISTIO',
    'Faltó': 'FALTO',
    Cancelada: 'CANCELADA',
    programada: 'PROGRAMADA',
    asistio: 'ASISTIO',
    asistió: 'ASISTIO',
    falto: 'FALTO',
    faltó: 'FALTO',
    cancelada: 'CANCELADA',
  };

  const mapped = estadoMap[estado];
  if (mapped) return mapped;

  const upper = estado.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (VALID_ESTADOS.includes(upper as EstadoAsistenciaValido)) {
    return upper as EstadoAsistenciaValido;
  }

  return null;
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

    const estadoEnum = toEstadoAsistenciaEnum(estado_asistencia);

    if (!estadoEnum) {
      return res.status(400).json({
        success: false,
        error: `Estado inválido: '${estado_asistencia}'. Valores válidos: ${VALID_ESTADOS.join(', ')}, Asistió, Faltó, Programada, Cancelada`,
      });
    }

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { inscripcion_id: parseInt(id) },
    });

    if (!inscripcion) {
      return res.status(404).json({ success: false, error: 'Inscripción no encontrada' });
    }

    // If changing from FALTO to another state, reverse the multa and adjust balance
    if (inscripcion.estado_asistencia === 'FALTO' && estadoEnum !== 'FALTO') {
      const multa = await prisma.multa.findFirst({
        where: { inscripcion_id: inscripcion.inscripcion_id, estado_pago: 'PENDIENTE' },
      });

      if (multa) {
        await prisma.estudiante.update({
          where: { estudiante_id: inscripcion.estudiante_id },
          data: { saldo_pendiente: { decrement: multa.monto } },
        });
        await prisma.multa.delete({ where: { multa_id: multa.multa_id } });
      }
    }

    const updated = await prisma.inscripcion.update({
      where: { inscripcion_id: parseInt(id) },
      data: { estado_asistencia: estadoEnum },
      include: {
        estudiante: true,
        sesion: { include: { nivel: true, profesor: true, salon: true } },
        multas: true,
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Asistencia actualizada. Si es Faltó, la multa se genera automáticamente.',
    } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};

export const deleteInscripcion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inscripcionId = parseInt(id);

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { inscripcion_id: inscripcionId },
    });

    if (!inscripcion) {
      return res.status(404).json({ success: false, error: 'Inscripción no encontrada' });
    }

    // Delete related multas first and adjust student balance for pending ones
    const multas = await prisma.multa.findMany({
      where: { inscripcion_id: inscripcionId },
    });

    for (const multa of multas) {
      if (multa.estado_pago === 'PENDIENTE') {
        await prisma.estudiante.update({
          where: { estudiante_id: inscripcion.estudiante_id },
          data: { saldo_pendiente: { decrement: multa.monto } },
        });
      }
      await prisma.multa.delete({
        where: { multa_id: multa.multa_id },
      });
    }

    await prisma.sesion.update({
      where: { sesion_id: inscripcion.sesion_id },
      data: { cupos_disponibles: { increment: 1 } },
    });

    await prisma.inscripcion.delete({
      where: { inscripcion_id: inscripcionId },
    });

    res.json({ success: true, message: 'Inscripción cancelada y cupo liberado' });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
};