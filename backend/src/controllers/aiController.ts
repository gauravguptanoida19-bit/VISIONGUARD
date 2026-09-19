import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { ragService } from '../services/ragService';
import { StorageRepository } from '../repositories/storage';

export const AIController = {
  async analyze(req: Request, res: Response) {
    try {
      const { incidentId, incidentData } = req.body;

      let incident = incidentData;
      if (incidentId && !incident) {
        incident = await StorageRepository.getIncidentById(incidentId);
      }

      if (!incident) {
        return res.status(400).json({ success: false, message: 'Valid incidentId or incidentData is required.' });
      }

      const analysis = await aiService.analyzeIncident(incident);
      if (incident.id) {
        await StorageRepository.updateIncidentAIAnalysis(incident.id, analysis);
      }

      return res.json({ success: true, analysis });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async search(req: Request, res: Response) {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, message: 'Search query string is required.' });
      }

      const ragResult = await ragService.searchAndAnswer(query);
      return res.json({ success: true, ...ragResult });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async copilot(req: Request, res: Response) {
    try {
      const { message, conversationHistory } = req.body;
      if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required.' });
      }

      const ragResult = await ragService.searchAndAnswer(message);
      return res.json({
        success: true,
        response: ragResult.answer,
        sources: ragResult.sources,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};
