import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.post('/analyze', authenticateJWT, requireRole('analyst', 'admin'), AIController.analyze);
router.post('/search', authenticateJWT, AIController.search);
router.post('/copilot', authenticateJWT, AIController.copilot);

export default router;
