import { Router } from 'express';
import { IncidentController } from '../controllers/incidentController';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// Viewer and above can view incidents
router.get('/', authenticateJWT, IncidentController.list);
router.get('/:id', authenticateJWT, IncidentController.getById);

// Analysts and Admins can create incidents, update status, and run AI analysis
router.post('/', authenticateJWT, requireRole('analyst', 'admin'), IncidentController.create);
router.put('/:id/status', authenticateJWT, requireRole('analyst', 'admin'), IncidentController.updateStatus);
router.post('/:id/notes', authenticateJWT, requireRole('analyst', 'admin'), IncidentController.addNote);
router.post('/:id/analyze', authenticateJWT, requireRole('analyst', 'admin'), IncidentController.analyze);

export default router;
