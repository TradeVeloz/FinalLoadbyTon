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

export interface UserProfile {
  companyName: string;
  trnNumber?: string;
  tradeLicenseNumber?: string;
  phone?: string;
  avatarUrl?: string;
  ratingAverage: number;
  completedJobsCount: number;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  profile?: UserProfile;
}

export interface Job {
  id: string;
  jobCode: string;
  shipperId: string;
  shipperName?: string;
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
  bidsCount?: number;
  lowestBidAED?: number;
  createdAt: string;
}

export interface Bid {
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
}

export interface Message {
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

export interface DocumentItem {
  id: string;
  jobId: string;
  uploaderId: string;
  type: string;
  title: string;
  fileUrl: string;
  fileSize?: string;
  createdAt: string;
}

export type PaymentStatus = 'PENDING' | 'ESCROW' | 'RELEASED' | 'DISPUTED';

export interface Payment {
  id: string;
  jobId: string;
  jobCode?: string;
  amountAED: number;
  platformFeeAED: number;
  netCarrierAED: number;
  status: PaymentStatus;
  transactionRef?: string;
  createdAt: string;
}

export type RatingCategory = 'PUNCTUALITY' | 'COMMUNICATION' | 'PROFESSIONALISM' | 'VALUE';

export interface Rating {
  id: string;
  jobId: string;
  raterId: string;
  rateeId: string;
  raterName?: string;
  score: number;
  comment?: string;
  category: RatingCategory;
  createdAt: string;
}
