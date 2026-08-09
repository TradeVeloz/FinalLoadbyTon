import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as notificationService from '../services/notificationService';

const router = Router();

router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const notifications = notificationService.listNotificationsForUser(req.user!.userId);
  const unread = notificationService.unreadCount(req.user!.userId);
  return res.json({ notifications, unread });
});

router.post('/read-all', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const marked = notificationService.markAllNotificationsRead(req.user!.userId);
  return res.json({ message: 'All notifications marked as read', marked });
});

router.post('/:id/read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const notification = notificationService.markNotificationRead(req.params.id);
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  return res.json(notification);
});

export default router;
