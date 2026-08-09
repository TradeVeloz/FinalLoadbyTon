export type Role = 'SHIPPER' | 'CARRIER' | 'ADMIN' | 'DRIVER';

export type ContainerSize = 'TWENTY_FT' | 'FORTY_FT' | 'FORTY_HC' | 'REEFER';

export type ContainerType = 'DRY' | 'REEFER' | 'HAZMAT' | 'OPEN_TOP' | 'FLAT_RACK';

export type Terminal = 'JEBEL_ALI_T1' | 'JEBEL_ALI_T2' | 'JEBEL_ALI_T3' | 'JEBEL_ALI_T4' | 'KHALIFA' | 'SHARJAH';

export type DeliveryArea = 'JAFZA_NORTH' | 'JAFZA_SOUTH' | 'AL_QUOZ' | 'DIP' | 'NIP' | 'DAFZA' | 'DIC' | 'DUBAI_SOUTH' | 'OTHER';

export type JobStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'BIDDING'
  | 'AWARDED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export type PaymentStatus = 'PENDING' | 'ESCROW' | 'RELEASED' | 'DISPUTED';

export type DocumentType =
  | 'CUSTOMS_CLEARANCE'
  | 'COLLECTION_RECEIPT'
  | 'POD'
  | 'TRADE_LICENSE'
  | 'INSURANCE'
  | 'OTHER';

export type NotificationType =
  | 'BID_RECEIVED'
  | 'BID_ACCEPTED'
  | 'JOB_AWARDED'
  | 'JOB_STARTED'
  | 'JOB_COMPLETED'
  | 'PAYMENT_RELEASED'
  | 'DEMURRAGE_ALERT';

export interface UserProfileRecord {
  id: string;
  userId: string;
  companyName: string;
  trnNumber?: string;
  tradeLicenseNumber?: string;
  phone?: string;
  avatarUrl?: string;
  bankName?: string;
  iban?: string;
  ratingAverage: number;
  completedJobsCount: number;
  isVerified: boolean;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  isVerified: boolean;
  mfaEnabled: boolean;
  mfaSecret?: string;
  notificationPrefs?: Record<string, boolean>;
  profile?: UserProfileRecord;
  createdAt: string;
}

export interface JobRecord {
  id: string;
  jobCode: string;
  shipperId: string;
  shipperName: string;
  carrierId?: string;
  carrierName?: string;
  containerSize: ContainerSize;
  containerType: ContainerType;
  containerNumber?: string;
  pickupTerminal?: Terminal;
  pickupAddress?: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryArea?: DeliveryArea;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  readyTime: string;
  deadline: string;
  maxBudgetAED?: number;
  agreedPriceAED?: number;
  status: JobStatus;
  notes?: string;
  requiresReefer: boolean;
  requiresHazmat: boolean;
  hazmatClass?: string;
  bidsCount: number;
  lowestBidAED?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BidRecord {
  id: string;
  jobId: string;
  carrierId: string;
  carrierName: string;
  carrierRating: number;
  completedJobs: number;
  amountAED: number;
  etaMinutes: number;
  truckType: string;
  driverName?: string;
  notes?: string;
  status: BidStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  jobId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DocumentRecord {
  id: string;
  jobId: string;
  uploaderId: string;
  type: DocumentType;
  title: string;
  fileUrl: string;
  fileSize?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  jobId: string;
  jobCode?: string;
  amountAED: number;
  platformFeeAED: number;
  netCarrierAED: number;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  transactionRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingRecord {
  id: string;
  jobId: string;
  raterId: string;
  rateeId: string;
  raterName?: string;
  score: number;
  comment?: string;
  category: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  jobId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TrackingRecord {
  jobId: string;
  status: JobStatus;
  currentLocation?: { lat: number; lng: number };
  speedKmH?: number;
  etaMinutes?: number;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  milestones: { label: string; timestamp: string; completed: boolean }[];
  points: { lat: number; lng: number; speedKmH: number; heading: number; timestamp: string }[];
  updatedAt: string;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  role: Role;
  isVerified: boolean;
  mfaEnabled: boolean;
  profile?: UserProfileRecord;
}

export interface AuthResponse {
  user: AuthUserResponse;
  token: string;
  refreshToken: string;
}

export interface UserStats {
  totalJobsPosted: number;
  totalBidsPlaced: number;
  totalSpentAED: number;
  totalEarnedAED: number;
  savingsPercentage: number;
  onTimeDeliveryRate: number;
  activeJobs: number;
  pendingBids: number;
}
