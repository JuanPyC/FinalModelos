import { Router } from 'express';
import { 
  getProfesores, 
  getProfesorById, 
  createProfesor, 
  updateProfesor, 
  deleteProfesor 
} from '../controllers/profesoresController';

const router = Router();

router.get('/', getProfesores);
router.get('/:id', getProfesorById);
router.post('/', createProfesor);
router.patch('/:id', updateProfesor);
router.delete('/:id', deleteProfesor);

export default router;
