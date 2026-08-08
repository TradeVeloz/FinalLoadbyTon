import { RatingRecord } from '../types';
import { uid } from '../utils/helpers';

export type RatingEntity = RatingRecord;

export function createRatingEntity(
  data: Omit<RatingRecord, 'id' | 'createdAt'>
): RatingEntity {
  return { ...data, id: uid('rat'), createdAt: new Date().toISOString() };
}

export function clampScore(score: number): number {
  return Math.min(5, Math.max(1, Math.round(score * 10) / 10));
}
