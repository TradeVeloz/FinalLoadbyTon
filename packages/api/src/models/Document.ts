import { DocumentRecord } from '../types';
import { uid } from '../utils/helpers';

export type DocumentEntity = DocumentRecord;

export function createDocumentEntity(
  data: Omit<DocumentRecord, 'id' | 'createdAt'>
): DocumentEntity {
  return { ...data, id: uid('doc'), createdAt: new Date().toISOString() };
}
