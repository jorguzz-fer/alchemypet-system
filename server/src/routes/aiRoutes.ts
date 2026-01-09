import { Router } from 'express';
import { categorize } from '../controllers/aiController';

const router = Router();

router.post('/categorize', categorize);

export default router;
