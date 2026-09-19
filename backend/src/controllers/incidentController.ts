import { Request, Response } from 'express';
import { StorageRepository } from '../repositories/storage';
import { socketService } from '../services/socketService';
import { aiService } from '../services/aiService';
import { Incident, IncidentStatus, Severity } from '@visionguard/shared';

export const IncidentController = {
  async list(req: Request, res: Response) {
    try {
      const { severity, status, cameraId, type, search, limit } = req.query;

      const incidents = await StorageRepository.getIncidents({
        severity: severity as Severity,
        status: status as IncidentStatus,
        cameraId: cameraId as string,
        type: type as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      return res.json({ success: true, count: incidents.length, incidents });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const incident = await StorageRepository.getIncidentById(id);
      if (!incident) {
        return res.status(404).json({ success: false, message: 'Incident not found.' });
      }
      return res.json({ success: true, incident });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { cameraId, type, severity, description, detectedObjects, evidenceFrames } = req.body;

      const camera = await StorageRepository.getCameraById(cameraId);
      const incCount = (await StorageRepository.getIncidents()).length;
      const incidentNumber = `VG-${1843 + incCount}`;

      const newIncident: Incident = {
        id: `inc-vg-${Date.now().toString().slice(-5)}`,
        incidentNumber,
        cameraId,
        cameraName: camera ? camera.name : cameraId,
        location: camera ? camera.location : 'Monitored Perimeter',
        type: type || 'restricted_zone_entry',
        severity: severity || 'HIGH',
        status: 'new',
        timestamp: new Date().toISOString(),
        duration: 35,
        description: description || 'Automated anomaly detected by VisionGuard engine.',
        detectedObjects: detectedObjects || [],
        evidenceFrames: evidenceFrames || [],
      };

      const created = await StorageRepository.createIncident(newIncident);

      // Emit real-time alert via Socket.IO
      socketService.emitIncidentAlert(created);

      return res.status(201).json({ success: true, incident: created });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      if (!['new', 'investigating', 'resolved', 'false_positive'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
      }

      const updated = await StorageRepository.updateIncidentStatus(id, status as IncidentStatus, note);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Incident not found.' });
      }

      return res.json({ success: true, incident: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async analyze(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const incident = await StorageRepository.getIncidentById(id);
      if (!incident) {
        return res.status(404).json({ success: false, message: 'Incident not found.' });
      }

      const report = await aiService.analyzeIncident(incident);
      await StorageRepository.updateIncidentAIAnalysis(id, report);

      const refreshed = await StorageRepository.getIncidentById(id);
      return res.json({ success: true, aiAnalysis: report, incident: refreshed });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async addNote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { note } = req.body;
      if (!note) {
        return res.status(400).json({ success: false, message: 'Note text is required.' });
      }

      const incident = await StorageRepository.getIncidentById(id);
      if (!incident) {
        return res.status(404).json({ success: false, message: 'Incident not found.' });
      }

      const updated = await StorageRepository.updateIncidentStatus(id, incident.status, note);
      return res.json({ success: true, incident: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};
