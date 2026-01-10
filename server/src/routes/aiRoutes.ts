import { Router } from 'express';
import { categorize, generateReport, generateMammary } from '../controllers/aiController';

const router = Router();

router.post('/categorize', categorize);
router.post('/generate-report', generateReport);
router.post('/generate-mammary', generateMammary);

export default router;
