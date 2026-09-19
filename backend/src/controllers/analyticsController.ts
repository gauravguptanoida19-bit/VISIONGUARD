import { Request, Response } from 'express';
import { StorageRepository } from '../repositories/storage';

export const AnalyticsController = {
  async getSummary(req: Request, res: Response) {
    try {
      const analytics = await StorageRepository.getAnalytics();
      return res.json({ success: true, analytics });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async getAuditLogs(req: Request, res: Response) {
    try {
      const logs = await StorageRepository.getAuditLogs();
      return res.json({ success: true, count: logs.length, logs });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};
