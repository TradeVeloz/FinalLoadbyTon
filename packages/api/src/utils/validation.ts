import { z } from 'zod';

const emailSchema = z.string().email('A valid email address is required').max(254);

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

const ROLES = ['SHIPPER', 'CARRIER', 'ADMIN', 'DRIVER'] as const;
const CONTAINER_SIZES = ['TWENTY_FT', 'FORTY_FT', 'FORTY_HC', 'REEFER'] as const;
const CONTAINER_TYPES = ['DRY', 'REEFER', 'HAZMAT', 'OPEN_TOP', 'FLAT_RACK'] as const;
const TERMINALS = ['JEBEL_ALI_T1', 'JEBEL_ALI_T2', 'JEBEL_ALI_T3', 'JEBEL_ALI_T4', 'KHALIFA', 'SHARJAH'] as const;
const DELIVERY_AREAS = ['JAFZA_NORTH', 'JAFZA_SOUTH', 'AL_QUOZ', 'DIP', 'NIP', 'DAFZA', 'DIC', 'DUBAI_SOUTH', 'OTHER'] as const;
const JOB_STATUSES = ['DRAFT', 'OPEN', 'BIDDING', 'AWARDED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED'] as const;
const DOCUMENT_TYPES = ['CUSTOMS_CLEARANCE', 'COLLECTION_RECEIPT', 'POD', 'TRADE_LICENSE', 'INSURANCE', 'OTHER'] as const;
const NOTIFICATION_TYPES = ['BID_RECEIVED', 'BID_ACCEPTED', 'JOB_AWARDED', 'JOB_STARTED', 'JOB_COMPLETED', 'PAYMENT_RELEASED', 'DEMURRAGE_ALERT'] as const;

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(ROLES),
  companyName: z.string().min(2, 'Company name is required').max(120),
  trnNumber: z.string().max(20).optional(),
  tradeLicenseNumber: z.string().max(30).optional(),
  phone: z.string().max(24).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const mfaVerifySchema = z.object({
  token: z.string().min(6, 'Enter the 6-digit code').max(8),
  secret: z.string().min(16),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
});

const jobFields = {
  containerSize: z.enum(CONTAINER_SIZES),
  containerType: z.enum(CONTAINER_TYPES),
  containerNumber: z.string().max(16).optional(),
  pickupTerminal: z.enum(TERMINALS),
  deliveryArea: z.enum(DELIVERY_AREAS),
  deliveryAddress: z.string().min(5, 'Delivery address is required').max(300),
  readyTime: z.string().datetime({ offset: true }),
  deadline: z.string().datetime({ offset: true }),
  maxBudgetAED: z.number().positive().max(1_000_000).optional(),
  requiresReefer: z.boolean().default(false),
  requiresHazmat: z.boolean().default(false),
  hazmatClass: z.string().max(80).optional(),
  notes: z.string().max(1000).optional(),
};

export const jobCreateSchema = z.object(jobFields).refine((d) => d.deadline > d.readyTime, {
  message: 'Deadline must be after ready time',
  path: ['deadline'],
});

export const jobUpdateSchema = z.object(jobFields).partial();

export const jobStatusSchema = z.object({
  status: z.enum(JOB_STATUSES),
});

export const bidCreateSchema = z.object({
  amountAED: z.number().positive().max(1_000_000),
  etaMinutes: z.number().int().positive().max(60 * 48),
  truckType: z.string().min(2).max(120),
  driverName: z.string().max(80).optional(),
  notes: z.string().max(500).optional(),
});

export const bidUpdateSchema = bidCreateSchema.partial();

export const messageCreateSchema = z.object({
  content: z.string().min(1).max(4000),
  attachmentUrl: z.string().url().optional(),
  attachmentName: z.string().max(255).optional(),
});

export const documentCreateSchema = z.object({
  type: z.enum(DOCUMENT_TYPES),
  title: z.string().min(2).max(200),
  fileUrl: z.string().url(),
  fileSize: z.string().max(30).optional(),
});

export const escrowSchema = z.object({
  jobId: z.string().min(3),
  amountAED: z.number().positive().max(1_000_000),
});

export const profileUpdateSchema = z.object({
  companyName: z.string().min(2).max(120).optional(),
  trnNumber: z.string().max(20).optional(),
  tradeLicenseNumber: z.string().max(30).optional(),
  phone: z.string().max(24).optional(),
  bankName: z.string().max(80).optional(),
  iban: z.string().max(34).optional(),
  avatarUrl: z.string().url().optional(),
});

export const notificationCreateSchema = z.object({
  userId: z.string().min(3),
  type: z.enum(NOTIFICATION_TYPES),
  title: z.string().min(1).max(120),
  message: z.string().min(1).max(500),
  jobId: z.string().optional(),
});

export const trackingUpdateSchema = z.object({
  status: z.enum(JOB_STATUSES).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  speedKmH: z.number().min(0).max(200).optional(),
  etaMinutes: z.number().int().min(0).max(60 * 48).optional(),
});
