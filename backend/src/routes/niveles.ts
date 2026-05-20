import { Router } from 'express';
import { 
  getNiveles, 
  getNivelById, 
  createNivel, 
  updateNivel, 
  deleteNivel 
} from '../controllers/nivelesController';

const router = Router();

router.get('/', getNiveles);
router.get('/:id', getNivelById);
router.post('/', createNivel);
router.patch('/:id', updateNivel);
router.delete('/:id', deleteNivel);

export default router;
