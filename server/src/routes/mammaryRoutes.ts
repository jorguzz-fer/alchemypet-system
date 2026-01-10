import { Router } from 'express';
import {
    createMammary,
    listMammary,
    getMammaryById,
    updateMammary,
    deleteMammary
} from '../controllers/mammaryController';

const router = Router();

router.post('/', createMammary);
router.get('/', listMammary);
router.get('/:id', getMammaryById);
router.put('/:id', updateMammary);
router.delete('/:id', deleteMammary);

export default router;
