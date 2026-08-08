import bcrypt from 'bcryptjs';
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/security';
import {
  AuthResponse,
  AuthUserResponse,
  Role,
  UserRecord,
  UserProfileRecord,
  UserStats,
} from '../types';

const DEMO_PASSWORD_HASH = bcrypt.hashSync('demo1234', 12);

const seedProfile = (
  userId: string,
  companyName: string,
  extra: Partial<UserProfileRecord>
): UserProfileRecord => ({
  id: `prof-${userId}`,
  userId,
  companyName,
  ratingAverage: 5,
  completedJobsCount: 0,
  isVerified: true,
  createdAt: new Date().toISOString(),
  ...extra,
});

const users: UserRecord[] = [
  {
    id: 'usr-shipper-1',
    email: 'shipper@uaeports.ae',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'SHIPPER',
    isVerified: true,
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    profile: seedProfile('usr-shipper-1', 'Al-Majid Global Freight LLC', {
      trnNumber: 'TRN-100293847500003',
      tradeLicenseNumber: 'CN-1029384',
      phone: '+971 4 881 2345',
      ratingAverage: 4.9,
      completedJobsCount: 142,
    }),
  },
  {
    id: 'usr-carrier-1',
    email: 'carrier@dubaidrayage.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'CARRIER',
    isVerified: true,
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    profile: seedProfile('usr-carrier-1', 'Emirates Overland Haulage Co.', {
      trnNumber: 'TRN-200384756100009',
      tradeLicenseNumber: 'CN-8839201',
      phone: '+971 50 987 6543',
      ratingAverage: 4.85,
      completedJobsCount: 320,
    }),
  },
  {
    id: 'usr-carrier-2',
    email: 'falcon@containerxpress.ae',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'CARRIER',
    isVerified: true,
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    profile: seedProfile('usr-carrier-2', 'Falcon Container Express LLC', {
      trnNumber: 'TRN-300981234560001',
      tradeLicenseNumber: 'CN-7729031',
      phone: '+971 55 210 8890',
      ratingAverage: 4.7,
      completedJobsCount: 184,
    }),
  },
  {
    id: 'usr-carrier-3',
    email: 'gulfheavy@fleet.ae',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'CARRIER',
    isVerified: true,
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    profile: seedProfile('usr-carrier-3', 'Gulf Heavy Transport Fleet', {
      trnNumber: 'TRN-400112890340009',
      tradeLicenseNumber: 'CN-3308812',
      phone: '+971 56 777 4432',
      ratingAverage: 4.9,
      completedJobsCount: 412,
    }),
  },
  {
    id: 'usr-admin-1',
    email: 'admin@loadbyton.ae',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'ADMIN',
    isVerified: true,
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    profile: seedProfile('usr-admin-1', 'Loadbyton Operations', {
      ratingAverage: 5,
      completedJobsCount: 0,
    }),
  },
];

export function toPublicUser(user: UserRecord): AuthUserResponse {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    mfaEnabled: user.mfaEnabled,
    profile: user.profile,
  };
}

function buildAuthResponse(user: UserRecord): AuthResponse {
  return {
    user: toPublicUser(user),
    token: generateToken({ userId: user.id, role: user.role }),
    refreshToken: generateRefreshToken({ userId: user.id }),
  };
}

export async function register(data: {
  email: string;
  password: string;
  role: Role;
  companyName: string;
  trnNumber?: string;
  tradeLicenseNumber?: string;
  phone?: string;
}): Promise<AuthResponse> {
  const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  if (existing) {
    throw Object.assign(new Error('An account with this email already exists'), { status: 409 });
  }

  const user: UserRecord = {
    id: `usr-${Date.now()}`,
    email: data.email.toLowerCase(),
    passwordHash: await bcrypt.hash(data.password, 12),
    role: data.role,
    isVerified: false,
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    profile: seedProfile('', data.companyName, {
      trnNumber: data.trnNumber,
      tradeLicenseNumber: data.tradeLicenseNumber,
      phone: data.phone,
    }),
  };
  user.profile!.id = `prof-${user.id}`;
  user.profile!.userId = user.id;

  users.push(user);
  return buildAuthResponse(user);
}

export async function login(email: string, password: string): Promise<AuthResponse | null> {
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return buildAuthResponse(user);
}

export function refresh(refreshToken: string): AuthResponse | null {
  let decoded: { userId: string };
  try {
    decoded = verifyRefreshToken(refreshToken) as { userId: string };
  } catch {
    return null;
  }
  const user = users.find((u) => u.id === decoded.userId);
  if (!user) return null;
  return buildAuthResponse(user);
}

export function getUserById(id: string): UserRecord | undefined {
  return users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): UserRecord | undefined {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function listUsers(): UserRecord[] {
  return users;
}

export function updateProfile(userId: string, data: Partial<Omit<UserProfileRecord, 'id' | 'userId'>>): UserRecord | undefined {
  const user = users.find((u) => u.id === userId);
  if (!user) return undefined;
  if (!user.profile) {
    user.profile = seedProfile(userId, user.email, {});
  }
  Object.assign(user.profile, data, { isVerified: user.profile.isVerified });
  return user;
}

export function requestVerification(userId: string): UserRecord | undefined {
  const user = users.find((u) => u.id === userId);
  if (!user) return undefined;
  return user;
}

export function verifyUser(adminId: string, userId: string): UserRecord | undefined {
  const admin = users.find((u) => u.id === adminId);
  if (!admin || admin.role !== 'ADMIN') {
    throw Object.assign(new Error('Only admins can verify users'), { status: 403 });
  }
  const user = users.find((u) => u.id === userId);
  if (!user) return undefined;
  user.isVerified = true;
  if (user.profile) user.profile.isVerified = true;
  return user;
}

export function setMfaSecret(userId: string, secret: string): void {
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.mfaSecret = secret;
    user.mfaEnabled = true;
  }
}

export function getStats(userId: string): UserStats {
  const user = users.find((u) => u.id === userId);
  const isCarrier = user?.role === 'CARRIER';
  return {
    totalJobsPosted: isCarrier ? 0 : 142,
    totalBidsPlaced: isCarrier ? 320 : 0,
    totalSpentAED: isCarrier ? 0 : 168400,
    totalEarnedAED: isCarrier ? 345000 : 0,
    savingsPercentage: isCarrier ? 0 : 14.2,
    onTimeDeliveryRate: isCarrier ? 98.6 : 0,
    activeJobs: 3,
    pendingBids: isCarrier ? 5 : 4,
  };
}
