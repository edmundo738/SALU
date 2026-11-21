export type Lang = 'pt' | 'en';
export type Theme = 'light' | 'dark';
export type ActiveMode = 'customer' | 'provider';

export type RequestStatus = 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type AgreementStatus =
  'PENDING_PROVIDER' | 'PENDING_CUSTOMER' | 'ACTIVE' | 'WORK_SUBMITTED' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';

export interface FileRecord {
  id: string;
  url: string;
  name: string;
  mime: string;
  size: number;
  visibility: 'public' | 'private';
}

export interface ProviderProfile {
  userId: string;
  displayName: string;
  headline: string;
  categoryId: string;
  bio: string;
  yearsExperience: number;
  whatsapp: string | null;
  published: boolean;
  avatar: FileRecord | null;
  provinceId: string;
  municipalityId: string;
  communeId: string;
  locationLabel: string;
  portfolio: FileRecord[];
  rating: number | null;
  reviewCount: number;
  completedJobs: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  contact: string;
  activeMode: ActiveMode;
  locale: Lang;
  theme: Theme;
  provinceId: string | null;
  municipalityId: string | null;
  communeId: string | null;
  locationLabel: string;
  avatar: FileRecord | null;
  bio: string;
  verificationLevel: number;
  createdAt: string;
  providerProfile: ProviderProfile | null;
}

export interface SessionUser {
  user: User;
  stats: UserStats;
}

export interface UserStats {
  requestsAsCustomer: number;
  openRequests: number;
  activeAgreements: number;
  completedAgreements: number;
  proposalsAsProvider: number;
  completedAsProvider: number;
  rating: number | null;
  reviewCount: number;
}

export interface RequestSummary {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: FileRecord | null;
  title: string;
  categoryId: string;
  description: string;
  provinceId: string;
  municipalityId: string;
  communeId: string;
  locationLabel: string;
  budgetType: 'FIXED' | 'INSPECTION_NEEDED';
  budgetAmount: number;
  urgency: 'NORMAL' | 'URGENT';
  status: RequestStatus;
  photos: FileRecord[];
  proposalCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string;
  providerHeadline: string;
  providerAvatar: FileRecord | null;
  providerRating: number | null;
  providerReviewCount: number;
  amount: number;
  estimatedDays: number;
  message: string;
  status: ProposalStatus;
  conversationId: string | null;
  createdAt: string;
}

export interface RequestDetail extends RequestSummary {
  proposals: Proposal[];
  agreementId: string | null;
  conversationId: string | null;
  isOwner: boolean;
  myProposal: Proposal | null;
  favorite: boolean;
}

export interface Agreement {
  id: string;
  requestId: string;
  requestTitle: string;
  categoryId: string;
  customerId: string;
  customerName: string;
  customerAvatar: FileRecord | null;
  providerId: string;
  providerName: string;
  providerHeadline: string;
  providerAvatar: FileRecord | null;
  amount: number;
  scope: string;
  deadline: string;
  status: AgreementStatus;
  customerAccepted: boolean;
  providerAccepted: boolean;
  providerCompleted: boolean;
  customerCompleted: boolean;
  completionNote: string;
  completionPhotos: FileRecord[];
  createdAt: string;
  updatedAt: string;
  myRole: ActiveMode;
  conversationId: string | null;
  myReview: Review | null;
  otherReview: Review | null;
}

export interface Conversation {
  id: string;
  requestId: string;
  requestTitle: string;
  otherPartyId: string;
  otherPartyName: string;
  otherPartyAvatar: FileRecord | null;
  otherPartyMode: ActiveMode;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: FileRecord | null;
  body: string;
  attachment: FileRecord | null;
  mine: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  requestId: string;
  authorId: string;
  authorName: string;
  targetId: string;
  authorRole: ActiveMode;
  communication: number;
  reliability: number;
  deadlines: number;
  comment: string;
  createdAt: string;
}

export interface ReviewList {
  reviews: Review[];
  rating: number | null;
  count: number;
  breakdown: { communication: number | null; reliability: number | null; deadlines: number | null };
}

export interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  targetType: 'user' | 'request' | 'message' | 'review';
  targetId: string;
  reason: string;
  details: string;
  status: 'OPEN' | 'REVIEWING' | 'RESOLVED';
  createdAt: string;
}

export interface ApiErrorPayload {
  error: string;
  code?: string;
  fields?: Record<string, string>;
}
