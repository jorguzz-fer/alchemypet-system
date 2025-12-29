import { Router } from 'express';
import * as macroscopyController from '../controllers/macroscopyController';

const router = Router();

router.post('/', macroscopyController.createMacroscopy);
router.get('/', macroscopyController.listMacroscopies);
router.get('/:id', macroscopyController.getMacroscopyById);
router.put('/:id', macroscopyController.updateMacroscopy); // New Route for Update

router.post('/:id/jar', macroscopyController.addJar);
router.post('/jar/:jarId/fragment', macroscopyController.addFragment);

export default router;
