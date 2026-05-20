import { Router } from 'express';
import {
  getEstudiantes,
  getEstudianteById,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante,
  getEstudianteMultas,
} from '../controllers/estudiantesController';

const router = Router();

router.get('/', getEstudiantes);
router.get('/:id/multas', getEstudianteMultas);
router.get('/:id', getEstudianteById);
router.post('/', createEstudiante);
router.patch('/:id', updateEstudiante);
router.delete('/:id', deleteEstudiante);

export default router;
