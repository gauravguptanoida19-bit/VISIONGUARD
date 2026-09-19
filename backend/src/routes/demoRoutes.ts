import { Router } from 'express';
import { DemoController } from '../controllers/demoController';

const router = Router();

// Demo mode control endpoints (public for hackathon agility)
router.get('/status', DemoController.status);
router.post('/start', DemoController.start);
router.post('/stop', DemoController.stop);
router.post('/trigger-incident', DemoController.triggerIncident);

export default router;
