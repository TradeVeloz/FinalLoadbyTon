import { MessageRecord } from '../types';
import { uid } from '../utils/helpers';

export type MessageEntity = MessageRecord;

export function createMessageEntity(
  data: Omit<MessageRecord, 'id' | 'isRead' | 'createdAt'>
): MessageEntity {
  return { ...data, id: uid('msg'), isRead: false, createdAt: new Date().toISOString() };
}
