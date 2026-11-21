export type UserRole = 'customer' | 'provider';

export type RequestState =
  | 'DRAFT'
  | 'OPEN'
  | 'PROPOSALS_RECEIVED'
  | 'NEGOTIATING'
  | 'AGREEMENT_CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETION_PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type ProviderEntityType = 'INDIVIDUAL' | 'SMALL_BUSINESS' | 'COMPANY';

export type UrgencyLevel = 'Flexible' | 'This Week' | 'Urgent (48h)';

export type ScreenId =
  | 'landing'
  | 'auth'
  | 'onboarding'
  | 'dashboard'
  | 'create-request'
  | 'discover-pros'
  | 'opportunities'
  | 'profile-detail'
  | 'customer-profile'
  | 'provider-onboarding'
  | 'requests'
  | 'request-detail'
  | 'messages'
  | 'reviews'
  | 'favorites'
  | 'notifications'
  | 'safety'
  | 'settings';

export interface ReliabilityBreakdown {
  communication: number;
  punctuality: number;
  qualityOrClarity: number;
  repeatRate: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  summary: string;
  outcome: string;
}

export interface Professional {
  id: string;
  name: string;
  businessName?: string;
  entityType: ProviderEntityType;
  profession: string;
  serviceTitle: string;
  category: string;
  location: string;
  municipality: string;
  serviceRadiusKm: number;
  distanceKm: number;
  avatarUrl: string;
  showcaseImageUrl: string;
  startingPriceKz: number;
  rating: number;
  verified: boolean;
  verificationLabel: string;
  bio: string;
  skills: string[];
  customTags: string[];
  completedJobs: number;
  responseTime: string;
  availability: string;
  pricingGuidance?: string;
  experienceYears?: number;
  reliability: ReliabilityBreakdown;
  portfolio: PortfolioItem[];
  contactPref: 'SALU Chat' | 'SALU + WhatsApp';
  whatsappNumber?: string;
  isFavorite?: boolean;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHeadline: string;
  authorAvatar: string;
  authorVerified: boolean;
  location: string;
  timestamp: string;
  category: string;
  title: string;
  body: string;
  imageUrl?: string;
  priceHighlight?: string;
  likes: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
}

export interface CustomerSummary {
  id: string;
  name: string;
  location: string;
  municipality: string;
  memberSince: string;
  verified: boolean;
  completedRequests: number;
  reliability: ReliabilityBreakdown;
  isFavorite?: boolean;
}

export interface Proposal {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string;
  providerProfession: string;
  providerAvatar: string;
  providerVerified: boolean;
  message: string;
  approach: string;
  suggestedPriceKz: number;
  estimatedDays: number;
  questions?: string;
  status: 'PENDING' | 'SHORTLISTED' | 'NEGOTIATING' | 'ACCEPTED' | 'DECLINED';
  submittedAt: string;
}

export interface Agreement {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string;
  customerName: string;
  agreedPriceKz: number;
  hidePricePublicly: boolean;
  scopeOfWork: string;
  deadline: string;
  location: string;
  providerResponsibilities: string;
  customerResponsibilities: string;
  additionalConditions: string;
  customerAccepted: boolean;
  providerAccepted: boolean;
  confirmedAt?: string;
}

export interface TimelineEvent {
  id: string;
  label: string;
  detail: string;
  timestamp: string;
  actor: string;
}

export interface ServiceRequest {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  municipality: string;
  distanceKm: number;
  budgetKz?: number;
  urgency: UrgencyLevel;
  availability: string;
  state: RequestState;
  createdAt: string;
  customerId: string;
  customerName: string;
  customerReliabilityScore: number;
  photos: string[];
  proposals: Proposal[];
  agreement?: Agreement;
  customerConfirmedCompletion: boolean;
  providerConfirmedCompletion: boolean;
  timeline: TimelineEvent[];
}

export interface ChatMessage {
  id: string;
  senderRole: UserRole;
  senderName: string;
  text: string;
  timestamp: string;
  attachmentName?: string;
}

export interface Conversation {
  id: string;
  requestId: string;
  requestTitle: string;
  otherPartyId: string;
  otherPartyName: string;
  otherPartyRoleLabel: string;
  otherPartyAvatar: string;
  otherPartyLocation: string;
  lastMessageAt: string;
  unreadCount: number;
  whatsappAvailable: boolean;
  messages: ChatMessage[];
}

export interface ReviewItem {
  id: string;
  requestId: string;
  requestTitle: string;
  authorName: string;
  authorRole: UserRole;
  targetName: string;
  targetRole: UserRole;
  date: string;
  communication: number;
  punctuality: number;
  qualityOrClarity: number;
  wouldWorkAgain: boolean;
  comment: string;
}

export type NotificationCategory =
  | 'request'
  | 'proposal'
  | 'message'
  | 'agreement'
  | 'status'
  | 'completion'
  | 'review'
  | 'moderation';

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  targetScreen: ScreenId;
  targetId?: string;
}

export interface ModerationCase {
  id: string;
  type: 'USER_REPORT' | 'LISTING_REPORT' | 'APPEAL';
  subjectName: string;
  reason: string;
  details: string;
  evidenceFile?: string;
  status: 'UNDER_REVIEW' | 'ACTION_TAKEN' | 'APPEAL_SUBMITTED' | 'RESOLVED';
  submittedAt: string;
  resolutionNote?: string;
}

export interface ProviderProfileDraft {
  entityType: ProviderEntityType;
  displayName: string;
  businessName: string;
  profession: string;
  category: string;
  bio: string;
  skills: string[];
  customTags: string[];
  municipality: string;
  neighborhood: string;
  serviceRadiusKm: number;
  availability: string;
  experienceOptional: string;
  pricingOptional: string;
  contactPref: 'SALU Chat' | 'SALU + WhatsApp';
  whatsappNumber: string;
  portfolioItems: PortfolioItem[];
}
