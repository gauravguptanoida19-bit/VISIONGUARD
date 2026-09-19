import { Request, Response } from 'express';
import { StorageRepository } from '../repositories/storage';
import { Camera, CameraTelemetry } from '@visionguard/shared';

export const CameraController = {
  async list(req: Request, res: Response) {
    try {
      const cameras = await StorageRepository.getCameras();
      return res.json({ success: true, cameras });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const camera = await StorageRepository.getCameraById(id);
      if (!camera) {
        return res.status(404).json({ success: false, message: 'Camera not found.' });
      }
      return res.json({ success: true, camera });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { id, name, location, streamUrl, fps, resolution, zones } = req.body;
      if (!id || !name || !location || !streamUrl) {
        return res.status(400).json({ success: false, message: 'id, name, location, and streamUrl are required.' });
      }

      const existing = await StorageRepository.getCameraById(id);
      if (existing) {
        return res.status(400).json({ success: false, message: `Camera ${id} already exists.` });
      }

      const newCamera: Camera = {
        id,
        name,
        location,
        streamUrl,
        thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
        status: 'online',
        fps: fps || 30,
        resolution: resolution || '1920x1080',
        zones: zones || [],
        activeObjectsCount: 0,
        lastHeartbeat: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const created = await StorageRepository.createCamera(newCamera);
      return res.status(201).json({ success: true, camera: created });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await StorageRepository.updateCamera(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Camera not found.' });
      }
      return res.json({ success: true, camera: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await StorageRepository.deleteCamera(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Camera not found.' });
      }
      return res.json({ success: true, message: `Camera ${id} deleted.` });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateZones(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { zones } = req.body;
      if (!Array.isArray(zones)) {
        return res.status(400).json({ success: false, message: 'zones must be an array.' });
      }

      const updated = await StorageRepository.updateCameraZones(id, zones);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Camera not found.' });
      }
      return res.json({ success: true, camera: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async getTelemetry(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const camera = await StorageRepository.getCameraById(id);
      if (!camera) {
        return res.status(404).json({ success: false, message: 'Camera not found.' });
      }

      const telemetry: CameraTelemetry = {
        cameraId: camera.id,
        timestamp: new Date().toISOString(),
        fps: camera.fps,
        objectsCount: camera.activeObjectsCount,
        detections: [
          {
            id: `det-${id}-1`,
            trackId: 27,
            class: 'person',
            confidence: 0.94,
            bbox: [0.35, 0.42, 0.52, 0.88],
            firstSeen: new Date(Date.now() - 47000).toISOString(),
            lastSeen: new Date().toISOString(),
            duration: 47,
          },
        ],
        anomaliesDetected: [],
      };

      return res.json({ success: true, telemetry });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};
