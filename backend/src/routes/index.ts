import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes';
import cameraRoutes from './cameraRoutes';
import incidentRoutes from './incidentRoutes';
import aiRoutes from './aiRoutes';
import analyticsRoutes from './analyticsRoutes';
import demoRoutes from './demoRoutes';
import notificationRoutes from './notificationRoutes';
import visionRoutes from './visionRoutes';
import { StorageRepository } from '../repositories/storage';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Health endpoint
router.get('/health', async (req: Request, res: Response) => {
  const isMemory = StorageRepository.isUsingMemory();
  return res.json({
    status: 'healthy',
    service: 'VisionGuard Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: isMemory ? 'in-memory-resilient' : 'mongodb-connected',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Detections endpoint
router.get('/detections', authenticateJWT, async (req: Request, res: Response) => {
  const cameras = await StorageRepository.getCameras();
  const sampleDetections = cameras.map((c) => ({
    cameraId: c.id,
    cameraName: c.name,
    location: c.location,
    detectedCount: c.activeObjectsCount,
    timestamp: new Date().toISOString(),
  }));
  return res.json({ success: true, count: sampleDetections.length, detections: sampleDetections });
});

router.use('/auth', authRoutes);
router.use('/cameras', cameraRoutes);
router.use('/incidents', incidentRoutes);
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/demo', demoRoutes);
router.use('/notifications', notificationRoutes);
router.use('/vision', visionRoutes);

export default router;
