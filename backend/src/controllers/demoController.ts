import { Request, Response } from 'express';
import { demoService } from '../services/demoService';

export const DemoController = {
  status(req: Request, res: Response) {
    return res.json({
      success: true,
      isRunning: demoService.isDemoRunning(),
      mode: 'DEMO MODE',
    });
  },

  start(req: Request, res: Response) {
    demoService.startDemo();
    return res.json({
      success: true,
      message: 'Live demo mode started. Telemetry stream active.',
      isRunning: true,
    });
  },

  stop(req: Request, res: Response) {
    demoService.stopDemo();
    return res.json({
      success: true,
      message: 'Live demo mode stopped.',
      isRunning: false,
    });
  },

  async triggerIncident(req: Request, res: Response) {
    try {
      const incident = await demoService.triggerLiveIncidentAlert();
      return res.json({
        success: true,
        message: 'Live incident triggered successfully and pushed via Socket.IO.',
        incident,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};
