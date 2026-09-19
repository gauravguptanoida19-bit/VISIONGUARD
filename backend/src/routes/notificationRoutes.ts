import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, NotificationController.list);
router.put('/:id/read', authenticateJWT, NotificationController.markRead);
router.post('/read-all', authenticateJWT, NotificationController.markAllRead);

export default router;
