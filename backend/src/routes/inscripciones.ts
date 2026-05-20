import { Router } from 'express';
import {
  getInscripciones,
  getInscripcionById,
  createInscripcion,
  updateInscripcionAsistencia,
  deleteInscripcion,
} from '../controllers/inscripcionesController';

const router = Router();

router.get('/', getInscripciones);
router.get('/:id', getInscripcionById);
router.post('/', createInscripcion);
router.patch('/:id', updateInscripcionAsistencia);
router.delete('/:id', deleteInscripcion);

export default router;