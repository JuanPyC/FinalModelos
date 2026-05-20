import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Placeholder for entity routes - will be uncommented when controllers are implemented
// import nivelesRouter from './niveles';
// import profesoresRouter from './profesores';
// import salonesRouter from './salones';
// import estudiantesRouter from './estudiantes';
// import sesionesRouter from './sesiones';
// import inscripcionesRouter from './inscripciones';
// import multasRouter from './multas';

// router.use('/niveles', nivelesRouter);
// router.use('/profesores', profesoresRouter);
// router.use('/salones', salonesRouter);
// router.use('/estudiantes', estudiantesRouter);
// router.use('/sesiones', sesionesRouter);
// router.use('/inscripciones', inscripcionesRouter);
// router.use('/multas', multasRouter);

export default router;
