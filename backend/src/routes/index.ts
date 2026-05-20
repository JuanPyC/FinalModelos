import { Router } from 'express';
import prisma from '../utils/db';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Basic connectivity check with Prisma
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      success: true, 
      message: 'API is running and database is connected' 
    });
  } catch (error) {
    res.status(503).json({ 
      success: false, 
      message: 'API is running but database is disconnected' 
    });
  }
});

// Entity routes
import nivelesRouter from './niveles';
import profesoresRouter from './profesores';
import salonesRouter from './salones';
import sesionesRouter from './sesiones';
import estudiantesRouter from './estudiantes';
import inscripcionesRouter from './inscripciones';
import multasRouter from './multas';

router.use('/niveles', nivelesRouter);
router.use('/profesores', profesoresRouter);
router.use('/salones', salonesRouter);
router.use('/sesiones', sesionesRouter);
router.use('/estudiantes', estudiantesRouter);
router.use('/inscripciones', inscripcionesRouter);
router.use('/multas', multasRouter);

export default router;
