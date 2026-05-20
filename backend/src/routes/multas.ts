import { Router } from 'express';
import {
  getMultas,
  getMultaById,
  getMultasPendientes,
  markMultaPagada,
} from '../controllers/multasController';

const router = Router();

router.get('/', getMultas);
router.get('/pendientes', getMultasPendientes);
router.get('/:id', getMultaById);
router.patch('/:id/pagar', markMultaPagada);

export default router;