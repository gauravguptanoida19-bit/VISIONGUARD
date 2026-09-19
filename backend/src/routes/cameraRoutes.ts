import { Router } from 'express';
import { CameraController } from '../controllers/cameraController';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// Viewer and above can view cameras
router.get('/', authenticateJWT, CameraController.list);
router.get('/:id', authenticateJWT, CameraController.getById);
router.get('/:id/telemetry', authenticateJWT, CameraController.getTelemetry);

// Admin only can mutate cameras and zones
router.post('/', authenticateJWT, requireRole('admin'), CameraController.create);
router.put('/:id', authenticateJWT, requireRole('admin'), CameraController.update);
router.delete('/:id', authenticateJWT, requireRole('admin'), CameraController.delete);
router.put('/:id/zones', authenticateJWT, requireRole('admin'), CameraController.updateZones);

export default router;
