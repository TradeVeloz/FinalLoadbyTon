import { NotificationRecord, NotificationType } from '../types';
import { broadcastToUser } from '../socket/emitter';

const notifications: NotificationRecord[] = [
  {
    id: 'ntf-901',
    userId: 'usr-shipper-1',
    type: 'BID_RECEIVED',
    title: 'New bid received',
    message: 'Emirates Overland Haulage Co. placed a bid of AED 1,180 on job LBT-DXB-2608-4921.',
    jobId: 'job-101',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'ntf-902',
    userId: 'usr-shipper-1',
    type: 'DEMURRAGE_ALERT',
    title: 'Demurrage window approaching',
    message: 'Free demurrage for MSKU9281745 expires in 18 hours. Award a carrier soon to avoid penalties.',
    jobId: 'job-101',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'ntf-903',
    userId: 'usr-carrier-1',
    type: 'JOB_AWARDED',
    title: 'Job awarded',
    message: 'You won job LBT-DXB-2608-8812 for AED 980. Container pickup at the designated UAE terminal.',
    jobId: 'job-102',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 9).toISOString(),
  },
];

export function createNotification(
  data: { userId: string; type: NotificationType; title: string; message: string; jobId?: string }
): NotificationRecord {
  const notification: NotificationRecord = {
    id: `ntf-${Date.now()}`,
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    jobId: data.jobId,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  notifications.push(notification);
  broadcastToUser(data.userId, 'notification', notification);
  return notification;
}

export function listNotificationsForUser(userId: string): NotificationRecord[] {
  return notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markNotificationRead(id: string): NotificationRecord | undefined {
  const notification = notifications.find((n) => n.id === id);
  if (!notification) return undefined;
  notification.isRead = true;
  return notification;
}

export function markAllNotificationsRead(userId: string): number {
  let count = 0;
  notifications.forEach((n) => {
    if (n.userId === userId && !n.isRead) {
      n.isRead = true;
      count += 1;
    }
  });
  return count;
}

export function unreadCount(userId: string): number {
  return notifications.filter((n) => n.userId === userId && !n.isRead).length;
}
