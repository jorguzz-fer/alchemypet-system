import { Router } from 'express';
import { categorize, generateReport } from '../controllers/aiController';

const router = Router();

router.post('/categorize', categorize);
router.post('/generate-report', generateReport);

export default router;
