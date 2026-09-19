import { Request, Response } from 'express';
import { StorageRepository } from '../repositories/storage';

export const NotificationController = {
  async list(req: Request, res: Response) {
    try {
      const { unreadOnly } = req.query;
      const notifications = await StorageRepository.getNotifications(unreadOnly === 'true');
      return res.json({ success: true, count: notifications.length, notifications });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async markRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await StorageRepository.markNotificationAsRead(id);
      return res.json({ success: true, message: 'Notification marked as read.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async markAllRead(req: Request, res: Response) {
    try {
      await StorageRepository.markAllNotificationsAsRead();
      return res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};
