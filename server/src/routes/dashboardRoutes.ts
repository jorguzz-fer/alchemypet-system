import { Router } from 'express';
import { getStats, getRecentActivity } from '../controllers/dashboardController';

const router = Router();

router.get('/stats', getStats);
router.get('/recent', getRecentActivity);

export default router;
