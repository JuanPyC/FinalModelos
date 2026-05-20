import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Entity routes
import nivelesRouter from './niveles';
// import profesoresRouter from './profesores';
import salonesRouter from './salones';
import sesionesRouter from './sesiones';
import estudiantesRouter from './estudiantes';
// import inscripcionesRouter from './inscripciones';
// import multasRouter from './multas';

router.use('/niveles', nivelesRouter);
// router.use('/profesores', profesoresRouter);
router.use('/salones', salonesRouter);
router.use('/sesiones', sesionesRouter);
router.use('/estudiantes', estudiantesRouter);
// router.use('/inscripciones', inscripcionesRouter);
// router.use('/multas', multasRouter);

export default router;
