import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, AnalyticsController.getSummary);
router.get('/audit-logs', authenticateJWT, AnalyticsController.getAuditLogs);

export default router;
