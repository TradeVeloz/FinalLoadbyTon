import { Role, UserRecord, UserProfileRecord, UserStats } from '../types';

export interface UserEntity extends UserRecord {
  role: Role;
  profile?: UserProfileRecord;
}

export function createUserEntity(data: Omit<UserRecord, 'id' | 'createdAt'>): UserEntity {
  return { id: `usr-${Date.now()}`, createdAt: new Date().toISOString(), ...data };
}

export function toPublicUserEntity(user: UserEntity): Omit<UserEntity, 'passwordHash' | 'mfaSecret'> {
  const { passwordHash: _ph, mfaSecret: _ms, ...publicUser } = user;
  return publicUser;
}

export type UserStatsEntity = UserStats;
