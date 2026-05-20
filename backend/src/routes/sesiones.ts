import { Router } from 'express';
import {
  getSesiones,
  getSesionById,
  createSesion,
  updateSesion,
  deleteSesion,
} from '../controllers/sesionesController';

const router = Router();

router.get('/', getSesiones);
router.get('/:id', getSesionById);
router.post('/', createSesion);
router.patch('/:id', updateSesion);
router.delete('/:id', deleteSesion);

export default router;
