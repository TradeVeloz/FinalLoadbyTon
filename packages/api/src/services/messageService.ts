import { MessageRecord } from '../types';

const messages: MessageRecord[] = [
  {
    id: 'msg-501',
    jobId: 'job-101',
    senderId: 'usr-shipper-1',
    senderName: 'Al-Majid Global Freight',
    content: 'Gate Pass DP World Jebel Ali has been issued for MSKU9281745.',
    attachmentUrl: '/docs/gatepass_MSKU9281745.pdf',
    attachmentName: 'DP_World_GatePass.pdf',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'msg-502',
    jobId: 'job-101',
    senderId: 'usr-carrier-1',
    senderName: 'Emirates Overland Haulage',
    content: 'Received Gate Pass. Driver Mohammed is currently queued at Gate 3 for container pickup.',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
  {
    id: 'msg-503',
    jobId: 'job-101',
    senderId: 'usr-carrier-1',
    senderName: 'Emirates Overland Haulage',
    content: 'Container mounted on flatbed. En route to JAFZA South Warehouse 8B.',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
  },
  {
    id: 'msg-504',
    jobId: 'job-102',
    senderId: 'usr-carrier-1',
    senderName: 'Emirates Overland Haulage',
    content: 'Driver assigned and heading to Terminal 1. Reefer unit temperature set at -18°C as per instruction.',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

export function listMessagesForJob(jobId: string): MessageRecord[] {
  return messages
    .filter((m) => m.jobId === jobId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function createMessage(
  jobId: string,
  data: { content: string; attachmentUrl?: string; attachmentName?: string },
  sender: { id: string; name: string }
): MessageRecord {
  const message: MessageRecord = {
    id: `msg-${Date.now()}`,
    jobId,
    senderId: sender.id,
    senderName: sender.name,
    content: data.content,
    attachmentUrl: data.attachmentUrl,
    attachmentName: data.attachmentName,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(message);
  return message;
}

export function markMessageRead(id: string): MessageRecord | undefined {
  const message = messages.find((m) => m.id === id);
  if (!message) return undefined;
  message.isRead = true;
  return message;
}

export function markJobMessagesRead(jobId: string, userId: string): number {
  let count = 0;
  messages.forEach((m) => {
    if (m.jobId === jobId && m.senderId !== userId && !m.isRead) {
      m.isRead = true;
      count += 1;
    }
  });
  return count;
}
