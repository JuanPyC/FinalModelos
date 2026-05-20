import { Router } from 'express';
import { getSalones, getSalonById, createSalon, updateSalon, deleteSalon } from '../controllers/salonesController';

const router = Router();

router.get('/', getSalones);
router.get('/:id', getSalonById);
router.post('/', createSalon);
router.patch('/:id', updateSalon);
router.delete('/:id', deleteSalon);

export default router;
