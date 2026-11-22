import { db } from './db.ts';
import type {
  Agreement,
  Conversation,
  FileRecord,
  Message,
  Notification,
  Proposal,
  RequestDetail,
  RequestSummary,
  Review,
  ReviewList,
  User,
  UserStats,
} from '../shared/types.ts';
import { locationLabel } from '../shared/geo.ts';

type Row = Record<string, any>;

export function fileRecord(id: string | null | undefined): FileRecord | null {
  if (!id) return null;
  const row = db.prepare('SELECT id, original_name, mime, size, visibility FROM files WHERE id = ?').get(id) as
    Row | undefined;
  if (!row) return null;
  return {
    id: row.id,
    url: `/api/files/${row.id}`,
    name: row.original_name,
    mime: row.mime,
    size: row.size,
    visibility: row.visibility,
  };
}

export function reviewAggregate(
  targetId: string,
  authorRole?: 'customer' | 'provider',
): {
  rating: number | null;
  count: number;
  breakdown: ReviewList['breakdown'];
} {
  const filter = authorRole ? ' AND author_role = ?' : '';
  const params = authorRole ? [targetId, authorRole] : [targetId];
  const row = db
    .prepare(
      `SELECT COUNT(*) as count,
              AVG((communication + reliability + deadlines) / 3.0) as rating,
              AVG(communication) as communication,
              AVG(reliability) as reliability,
              AVG(deadlines) as deadlines
       FROM reviews WHERE target_id = ?${filter}`,
    )
    .get(...params) as Row;
  return {
    rating: row.rating == null ? null : Math.round(row.rating * 10) / 10,
    count: Number(row.count || 0),
    breakdown: {
      communication: row.communication == null ? null : Math.round(row.communication * 10) / 10,
      reliability: row.reliability == null ? null : Math.round(row.reliability * 10) / 10,
      deadlines: row.deadlines == null ? null : Math.round(row.deadlines * 10) / 10,
    },
  };
}

export function userStats(userId: string): UserStats {
  const requests = db
    .prepare(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open
       FROM requests WHERE customer_id = ?`,
    )
    .get(userId) as Row;
  const active = db
    .prepare(
      `SELECT COUNT(*) as c FROM agreements
       WHERE status IN ('ACTIVE','WORK_SUBMITTED','PENDING_PROVIDER','PENDING_CUSTOMER')
         AND (customer_id = ? OR provider_id = ?)`,
    )
    .get(userId, userId) as Row;
  const completed = db
    .prepare(
      `SELECT COUNT(*) as c FROM agreements
       WHERE status = 'COMPLETED' AND (customer_id = ? OR provider_id = ?)`,
    )
    .get(userId, userId) as Row;
  const proposals = db.prepare('SELECT COUNT(*) as c FROM proposals WHERE provider_id = ?').get(userId) as Row;
  const providerCompleted = db
    .prepare("SELECT COUNT(*) as c FROM agreements WHERE provider_id = ? AND status = 'COMPLETED'")
    .get(userId) as Row;
  const rating = reviewAggregate(userId, 'customer');
  return {
    requestsAsCustomer: Number(requests.total || 0),
    openRequests: Number(requests.open || 0),
    activeAgreements: Number(active.c || 0),
    completedAgreements: Number(completed.c || 0),
    proposalsAsProvider: Number(proposals.c || 0),
    completedAsProvider: Number(providerCompleted.c || 0),
    rating: rating.rating,
    reviewCount: rating.count,
  };
}

export function providerProfileFor(userId: string) {
  const row = db.prepare('SELECT * FROM provider_profiles WHERE user_id = ?').get(userId) as Row | undefined;
  if (!row) return null;
  // O avatar é do utilizador; provider_profiles.avatar_file_id pode estar vazio.
  const owner = db.prepare('SELECT avatar_file_id FROM users WHERE id = ?').get(userId) as Row | undefined;
  const portfolio = db
    .prepare('SELECT file_id FROM provider_portfolio WHERE user_id = ? ORDER BY position ASC')
    .all(userId) as Array<{ file_id: string }>;
  const aggregate = reviewAggregate(userId, 'customer');
  const completed = db
    .prepare("SELECT COUNT(*) as c FROM agreements WHERE provider_id = ? AND status = 'COMPLETED'")
    .get(userId) as Row;
  return {
    userId,
    displayName: row.display_name,
    headline: row.headline,
    categoryId: row.category_id,
    bio: row.bio,
    yearsExperience: row.years_experience,
    whatsapp: row.whatsapp || null,
    published: Boolean(row.published),
    avatar: fileRecord(owner?.avatar_file_id || row.avatar_file_id),
    provinceId: row.province_id,
    municipalityId: row.municipality_id,
    communeId: row.commune_id,
    locationLabel: locationLabel(row.province_id, row.municipality_id, row.commune_id),
    portfolio: portfolio.map((p) => fileRecord(p.file_id)).filter(Boolean),
    rating: aggregate.rating,
    reviewCount: aggregate.count,
    completedJobs: Number(completed.c || 0),
    createdAt: row.created_at,
  };
}

export function serializeUser(userId: string): User | null {
  const row = db
    .prepare(
      `SELECT u.*, f.id as avatar_id
       FROM users u LEFT JOIN files f ON f.id = u.avatar_file_id
       WHERE u.id = ? AND u.deleted_at IS NULL`,
    )
    .get(userId) as Row | undefined;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    contact: row.contact,
    activeMode: row.active_mode,
    locale: row.locale,
    theme: row.theme,
    provinceId: row.province_id,
    municipalityId: row.municipality_id,
    communeId: row.commune_id,
    locationLabel: locationLabel(row.province_id, row.municipality_id, row.commune_id),
    avatar: fileRecord(row.avatar_id),
    bio: row.bio,
    verificationLevel: row.verification_level,
    createdAt: row.created_at,
    providerProfile: providerProfileFor(row.id),
  };
}

function requestRow(id: string): Row | undefined {
  return db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as Row | undefined;
}

export function serializeProposal(row: Row): Proposal {
  const profile = db
    .prepare('SELECT display_name, headline FROM provider_profiles WHERE user_id = ?')
    .get(row.provider_id) as Row | undefined;
  const user = db.prepare('SELECT name, avatar_file_id FROM users WHERE id = ?').get(row.provider_id) as Row;
  const rating = reviewAggregate(row.provider_id, 'customer');
  const conversation = db
    .prepare('SELECT id FROM conversations WHERE request_id = ? AND provider_id = ?')
    .get(row.request_id, row.provider_id) as { id: string } | undefined;
  return {
    id: row.id,
    requestId: row.request_id,
    providerId: row.provider_id,
    providerName: profile?.display_name || user?.name || 'Prestador',
    providerHeadline: profile?.headline || '',
    providerAvatar: fileRecord(user?.avatar_file_id),
    providerRating: rating.rating,
    providerReviewCount: rating.count,
    amount: row.amount,
    estimatedDays: row.estimated_days,
    message: row.message,
    status: row.status,
    conversationId: conversation?.id || null,
    createdAt: row.created_at,
  };
}

export function serializeRequest(id: string, viewerId: string | null): RequestDetail | null {
  const row = requestRow(id);
  if (!row) return null;
  const customer = db.prepare('SELECT name, avatar_file_id FROM users WHERE id = ?').get(row.customer_id) as Row;
  const photos = db
    .prepare('SELECT file_id FROM request_photos WHERE request_id = ? ORDER BY position ASC')
    .all(id) as Array<{ file_id: string }>;
  const count = db.prepare('SELECT COUNT(*) as c FROM proposals WHERE request_id = ?').get(id) as Row;
  const isOwner = viewerId === row.customer_id;
  const myProposalRow = viewerId
    ? (db.prepare('SELECT * FROM proposals WHERE request_id = ? AND provider_id = ?').get(id, viewerId) as
        Row | undefined)
    : undefined;
  const proposalRows = isOwner
    ? (db.prepare('SELECT * FROM proposals WHERE request_id = ? ORDER BY created_at DESC').all(id) as Row[])
    : myProposalRow
      ? [myProposalRow]
      : [];
  const agreement = db.prepare('SELECT id FROM agreements WHERE request_id = ?').get(id) as Row | undefined;
  const conversation =
    viewerId && viewerId !== row.customer_id
      ? (db.prepare('SELECT id FROM conversations WHERE request_id = ? AND provider_id = ?').get(id, viewerId) as
          Row | undefined)
      : undefined;
  const favorite = false;
  const base: RequestSummary = {
    id: row.id,
    customerId: row.customer_id,
    customerName: customer?.name || 'Cliente',
    customerAvatar: fileRecord(customer?.avatar_file_id),
    title: row.title,
    categoryId: row.category_id,
    description: row.description,
    provinceId: row.province_id,
    municipalityId: row.municipality_id,
    communeId: row.commune_id,
    locationLabel: locationLabel(row.province_id, row.municipality_id, row.commune_id),
    budgetType: row.budget_type,
    budgetAmount: row.budget_amount,
    urgency: row.urgency,
    status: row.status,
    photos: photos.map((p) => fileRecord(p.file_id)).filter(Boolean) as FileRecord[],
    proposalCount: Number(count.c || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  return {
    ...base,
    proposals: proposalRows.map(serializeProposal),
    agreementId: agreement?.id || null,
    conversationId: conversation?.id || null,
    isOwner,
    myProposal: myProposalRow ? serializeProposal(myProposalRow) : null,
    favorite,
  };
}

export function serializeAgreement(id: string, viewerId: string): Agreement | null {
  const row = db.prepare('SELECT * FROM agreements WHERE id = ?').get(id) as Row | undefined;
  if (!row) return null;
  if (viewerId !== row.customer_id && viewerId !== row.provider_id) return null;
  const request = db.prepare('SELECT title, category_id FROM requests WHERE id = ?').get(row.request_id) as Row;
  const customer = db.prepare('SELECT name, avatar_file_id FROM users WHERE id = ?').get(row.customer_id) as Row;
  const provider = db.prepare('SELECT name, avatar_file_id FROM users WHERE id = ?').get(row.provider_id) as Row;
  const profile = db
    .prepare('SELECT display_name, headline FROM provider_profiles WHERE user_id = ?')
    .get(row.provider_id) as Row | undefined;
  const photos = db
    .prepare('SELECT file_id FROM completion_photos WHERE agreement_id = ? ORDER BY position ASC')
    .all(id) as Array<{ file_id: string }>;
  const conversation = db
    .prepare('SELECT id FROM conversations WHERE request_id = ? AND provider_id = ?')
    .get(row.request_id, row.provider_id) as Row | undefined;
  const reviews = db.prepare('SELECT * FROM reviews WHERE request_id = ?').all(row.request_id) as Row[];
  const mine = reviews.find((r) => r.author_id === viewerId);
  const other = reviews.find((r) => r.author_id !== viewerId);
  return {
    id: row.id,
    requestId: row.request_id,
    requestTitle: request?.title || '',
    categoryId: request?.category_id || '',
    customerId: row.customer_id,
    customerName: customer?.name || 'Cliente',
    customerAvatar: fileRecord(customer?.avatar_file_id),
    providerId: row.provider_id,
    providerName: profile?.display_name || provider?.name || 'Prestador',
    providerHeadline: profile?.headline || '',
    providerAvatar: fileRecord(provider?.avatar_file_id),
    amount: row.amount,
    scope: row.scope,
    deadline: row.deadline,
    status: row.status,
    customerAccepted: Boolean(row.customer_accepted),
    providerAccepted: Boolean(row.provider_accepted),
    providerCompleted: Boolean(row.provider_completed),
    customerCompleted: Boolean(row.customer_completed),
    completionNote: row.completion_note,
    completionPhotos: photos.map((p) => fileRecord(p.file_id)).filter(Boolean) as FileRecord[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    myRole: viewerId === row.customer_id ? 'customer' : 'provider',
    conversationId: conversation?.id || null,
    myReview: mine ? serializeReview(mine) : null,
    otherReview: other ? serializeReview(other) : null,
  };
}

export function serializeConversation(row: Row, viewerId: string): Conversation {
  const otherId = viewerId === row.customer_id ? row.provider_id : row.customer_id;
  const other = db.prepare('SELECT name, avatar_file_id, active_mode FROM users WHERE id = ?').get(otherId) as Row;
  const profile = db.prepare('SELECT display_name FROM provider_profiles WHERE user_id = ?').get(otherId) as
    Row | undefined;
  const last = db
    .prepare('SELECT body FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(row.id) as Row | undefined;
  const unread = db
    .prepare(
      'SELECT COUNT(*) as c FROM messages WHERE conversation_id = ? AND sender_id != ? AND created_at > COALESCE((SELECT last_read_at FROM conversation_reads WHERE conversation_id = ? AND user_id = ?), ?)',
    )
    .get(row.id, viewerId, row.id, viewerId, row.created_at) as Row;
  return {
    id: row.id,
    requestId: row.request_id,
    requestTitle: row.request_title || '',
    otherPartyId: otherId,
    otherPartyName: profile?.display_name || other?.name || 'Utilizador',
    otherPartyAvatar: fileRecord(other?.avatar_file_id),
    otherPartyMode: other?.active_mode || 'customer',
    lastMessage: last?.body || '',
    lastMessageAt: row.last_message_at,
    unreadCount: Number(unread.c || 0),
  };
}

export function serializeMessage(row: Row, viewerId: string): Message {
  const sender = db.prepare('SELECT name, avatar_file_id FROM users WHERE id = ?').get(row.sender_id) as Row;
  const attachment = db.prepare('SELECT file_id FROM message_attachments WHERE message_id = ? LIMIT 1').get(row.id) as
    Row | undefined;
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    senderName: sender?.name || 'Utilizador',
    senderAvatar: fileRecord(sender?.avatar_file_id),
    body: row.body,
    attachment: fileRecord(attachment?.file_id),
    mine: row.sender_id === viewerId,
    createdAt: row.created_at,
  };
}

export function serializeReview(row: Row): Review {
  return {
    id: row.id,
    requestId: row.request_id,
    authorId: row.author_id,
    authorName:
      (db.prepare('SELECT name FROM users WHERE id = ?').get(row.author_id) as Row | undefined)?.name || 'Utilizador',
    targetId: row.target_id,
    authorRole: row.author_role,
    communication: row.communication,
    reliability: row.reliability,
    deadlines: row.deadlines,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export function serializeNotification(row: Row): Notification {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    link: row.link,
    read: Boolean(row.read),
    createdAt: row.created_at,
  };
}
