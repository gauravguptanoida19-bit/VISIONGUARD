import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticateJWT, AuthController.me);
router.get('/users', authenticateJWT, requireRole('admin'), AuthController.listUsers);
router.put('/users/:id/role', authenticateJWT, requireRole('admin'), AuthController.updateUserRole);

export default router;
