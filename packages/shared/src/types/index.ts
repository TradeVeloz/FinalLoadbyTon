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

export type RatingCategory = 'PUNCTUALITY' | 'COMMUNICATION' | 'PROFESSIONALISM' | 'VALUE';

export interface UserProfile {
  id: string;
  userId: string;
  companyName: string;
  trnNumber?: string;
  tradeLicenseNumber?: string;
  phone?: string;
  avatarUrl?: string;
  ratingAverage: number;
  completedJobsCount: number;
  isVerified: boolean;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  mfaEnabled: boolean;
  isVerified: boolean;
  profile?: UserProfile;
  createdAt: string;
}

export interface Job {
  id: string;
  jobCode: string;
  shipperId: string;
  carrierId?: string;
  containerSize: ContainerSize;
  containerType: ContainerType;
  containerNumber?: string;
  pickupTerminal: Terminal;
  deliveryArea: DeliveryArea;
  deliveryAddress: string;
  readyTime: string;
  deadline: string;
  maxBudgetAED?: number;
  agreedPriceAED?: number;
  status: JobStatus;
  notes?: string;
  requiresReefer: boolean;
  requiresHazmat: boolean;
  hazmatClass?: string;
  shipper?: User;
  carrier?: User;
  bidsCount?: number;
  lowestBidAED?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  jobId: string;
  carrierId: string;
  amountAED: number;
  etaMinutes: number;
  truckType: string;
  driverName?: string;
  notes?: string;
  status: BidStatus;
  carrier?: User;
  createdAt: string;
}

export interface Message {
  id: string;
  jobId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isRead: boolean;
  sender?: User;
  createdAt: string;
}

export interface Document {
  id: string;
  jobId: string;
  uploaderId: string;
  type: DocumentType;
  title: string;
  fileUrl: string;
  fileSize?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  jobId: string;
  amountAED: number;
  platformFeeAED: number;
  netCarrierAED: number;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  transactionRef?: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  jobId: string;
  raterId: string;
  rateeId: string;
  score: number;
  comment?: string;
  category: RatingCategory;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  jobId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TrackingPoint {
  lat: number;
  lng: number;
  speedKmH: number;
  heading: number;
  timestamp: string;
  milestone?: string;
}
