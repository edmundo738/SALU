import type {
  Agreement,
  Conversation,
  FileRecord,
  Message,
  Notification,
  ProviderProfile,
  RequestDetail,
  Review,
  ReviewList,
  SessionUser,
  User,
  UserStats,
} from '../../shared/types';
import type { Province } from '../../shared/geo';

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api';

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', 0);
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json().catch(() => null) : null;

  if (response.ok && !contentType.includes('application/json')) {
    throw new ApiError('API_NOT_JSON', 502);
  }

  if (!response.ok) {
    const message = payload?.error || `HTTP_${response.status}`;
    throw new ApiError(message, response.status, payload?.fields);
  }
  return payload as T;
}

function body(data: unknown): string {
  return JSON.stringify(data);
}

export const api = {
  // auth
  me: () => request<SessionUser>('/auth/me'),
  register: (data: { name: string; contact: string; password: string; passwordConfirm: string }) =>
    request<SessionUser>('/auth/register', { method: 'POST', body: body(data) }),
  login: (data: { contact: string; password: string }) =>
    request<SessionUser>('/auth/login', { method: 'POST', body: body(data) }),
  logout: () => request<{ success: true }>('/auth/logout', { method: 'POST' }),

  onboarding: (data: {
    activeMode: 'customer' | 'provider';
    provinceId: string;
    municipalityId: string;
    communeId: string;
  }) => request<{ user: User; stats: UserStats }>('/me/onboarding', { method: 'POST', body: body(data) }),

  updateMe: (
    data: Partial<{
      name: string;
      locale: 'pt' | 'en';
      theme: 'light' | 'dark';
      activeMode: 'customer' | 'provider';
      bio: string;
      provinceId: string;
      municipalityId: string;
      communeId: string;
      avatarFileId: string;
    }>,
  ) => request<{ user: User; stats: UserStats }>('/me', { method: 'PATCH', body: body(data) }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ success: true }>('/me/password', { method: 'POST', body: body(data) }),

  exportData: () => request<Record<string, unknown>>('/me/export'),
  deleteAccount: (password: string) =>
    request<{ success: true }>('/me', { method: 'DELETE', body: body({ password }) }),

  // geo
  geo: () => request<{ provinces: Province[] }>('/geo'),

  // providers
  providers: (params: { category?: string; municipality?: string; q?: string } = {}) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
    return request<{ providers: ProviderProfile[] }>(`/providers?${query.toString()}`);
  },
  provider: (id: string) =>
    request<{ provider: ProviderProfile; reviews: Review[]; reviewSummary: ReviewList; isFavorite: boolean }>(
      `/providers/${encodeURIComponent(id)}`,
    ),
  myProvider: () => request<{ provider: ProviderProfile | null }>('/me/provider'),
  saveProvider: (data: Record<string, unknown>) =>
    request<{ provider: ProviderProfile; user: User }>('/me/provider', { method: 'PUT', body: body(data) }),
  publishProvider: () => request<{ provider: ProviderProfile; user: User }>('/me/provider/publish', { method: 'POST' }),
  unpublishProvider: () => request<{ provider: ProviderProfile }>('/me/provider/unpublish', { method: 'POST' }),
  favorite: (id: string, on: boolean) =>
    request<{ favorite: boolean }>(`/favorites/${id}`, { method: on ? 'POST' : 'DELETE' }),

  // requests
  requests: (
    params: { scope?: 'mine' | 'open'; category?: string; municipality?: string; status?: string; q?: string } = {},
  ) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
    return request<{ requests: RequestDetail[] }>(`/requests?${query.toString()}`);
  },
  request: (id: string) => request<{ request: RequestDetail }>(`/requests/${encodeURIComponent(id)}`),
  createRequest: (data: Record<string, unknown>) =>
    request<{ request: RequestDetail }>('/requests', { method: 'POST', body: body(data) }),
  updateRequest: (id: string, data: Record<string, unknown>) =>
    request<{ request: RequestDetail }>(`/requests/${id}`, { method: 'PATCH', body: body(data) }),
  cancelRequest: (id: string) => request<{ request: RequestDetail }>(`/requests/${id}/cancel`, { method: 'POST' }),

  // proposals
  propose: (requestId: string, data: { amount: number; estimatedDays: number; message: string }) =>
    request<{ proposal: unknown; request: RequestDetail }>(`/requests/${requestId}/proposals`, {
      method: 'POST',
      body: body(data),
    }),
  acceptProposal: (id: string) => request<{ agreement: Agreement }>(`/proposals/${id}/accept`, { method: 'POST' }),
  rejectProposal: (id: string) => request<{ success: true }>(`/proposals/${id}/reject`, { method: 'POST' }),
  withdrawProposal: (id: string) => request<{ success: true }>(`/proposals/${id}/withdraw`, { method: 'POST' }),

  // agreements
  agreement: (id: string) => request<{ agreement: Agreement }>(`/agreements/${id}`),
  acceptAgreement: (id: string) => request<{ agreement: Agreement }>(`/agreements/${id}/accept`, { method: 'POST' }),
  declineAgreement: (id: string) => request<{ agreement: Agreement }>(`/agreements/${id}/decline`, { method: 'POST' }),
  cancelAgreement: (id: string) => request<{ agreement: Agreement }>(`/agreements/${id}/cancel`, { method: 'POST' }),
  submitCompletion: (id: string, data: { note: string; photoIds: string[] }) =>
    request<{ agreement: Agreement }>(`/agreements/${id}/submit-completion`, { method: 'POST', body: body(data) }),
  confirmCompletion: (id: string) => request<{ agreement: Agreement }>(`/agreements/${id}/confirm`, { method: 'POST' }),
  requestChanges: (id: string, note: string) =>
    request<{ agreement: Agreement }>(`/agreements/${id}/request-changes`, { method: 'POST', body: body({ note }) }),
  dispute: (id: string, reason: string) =>
    request<{ agreement: Agreement }>(`/agreements/${id}/dispute`, { method: 'POST', body: body({ reason }) }),
  review: (id: string, data: { communication: number; reliability: number; deadlines: number; comment: string }) =>
    request<{ review: Review }>(`/agreements/${id}/reviews`, { method: 'POST', body: body(data) }),
  myReviews: () => request<{ reviews: Review[] }>('/me/reviews'),

  // conversations
  conversations: () => request<{ conversations: Conversation[]; unread: number }>('/conversations'),
  messages: (id: string) =>
    request<{ conversation: Conversation; messages: Message[] }>(`/conversations/${id}/messages`),
  sendMessage: (id: string, data: { body: string; fileIds?: string[] }) =>
    request<{ message: Message }>(`/conversations/${id}/messages`, { method: 'POST', body: body(data) }),
  readConversation: (id: string) => request<{ success: true }>(`/conversations/${id}/read`, { method: 'POST' }),

  // notifications
  notifications: () => request<{ notifications: Notification[]; unread: number }>('/notifications'),
  readNotification: (id: string) => request<{ success: true }>(`/notifications/${id}/read`, { method: 'POST' }),
  readAllNotifications: () => request<{ success: true }>('/notifications/read-all', { method: 'POST' }),

  // reports + verification
  report: (data: { targetType: string; targetId: string; reason: string; details: string }) =>
    request<{ report: { id: string; status: string } }>('/reports', { method: 'POST', body: body(data) }),
  myReports: () =>
    request<{
      reports: Array<{
        id: string;
        target_type: string;
        target_id: string;
        reason: string;
        details: string;
        status: string;
        appeal_status: string | null;
        created_at: string;
      }>;
    }>('/reports/mine'),
  appealReport: (id: string, message: string) =>
    request<{ appeal: { id: string; status: string } }>(`/reports/${encodeURIComponent(id)}/appeal`, {
      method: 'POST',
      body: body({ message }),
    }),
  verification: () =>
    request<{
      currentLevel: number;
      historyLevel: number | null;
      requests: Array<{
        id: string;
        kind: string;
        status: string;
        notes: string;
        review_note: string;
        created_at: string;
        reviewed_at: string | null;
      }>;
      levels: Array<{ level: number; pt: string; en: string; available: boolean }>;
    }>('/me/verification'),
  requestVerification: async (file: File, kind: 'identity' | 'qualification', notes: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('kind', kind);
    form.append('notes', notes);
    return request<{ id: string; status: string }>('/verification/requests', { method: 'POST', body: form });
  },

  // files
  upload: async (file: File, purpose: 'avatar' | 'portfolio' | 'request' | 'message' | 'completion' | 'report') => {
    const form = new FormData();
    form.append('file', file);
    form.append('purpose', purpose);
    return request<{ file: FileRecord }>('/files', { method: 'POST', body: form });
  },
  uploadAvatar: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<{ user: User }>('/me/avatar', { method: 'POST', body: form });
  },
  uploadPortfolio: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<{ file: FileRecord; provider: ProviderProfile }>('/me/portfolio', { method: 'POST', body: form });
  },
  removePortfolio: (fileId: string) =>
    request<{ provider: ProviderProfile }>(`/me/portfolio/${fileId}`, { method: 'DELETE' }),

  /**
   * Ficheiros públicos passam pelo proxy do próprio site (`/media/*` → API).
   * Assim a imagem vem do mesmo domínio da página e não é bloqueada por
   * políticas entre domínios (CORP/CSP), sem depender do servidor.
   */
  fileUrl: (file: FileRecord | null | undefined) =>
    file ? (file.visibility === 'public' ? `/media/${file.id}` : `${BASE}/files/${file.id}`) : '',
  /** URL directo da API — usado como alternativa e para ficheiros privados. */
  fileUrlDirect: (file: FileRecord | null | undefined) => (file ? `${BASE}/files/${file.id}` : ''),
  /** Lê um ficheiro privado com a sessão e devolve um objecto local (blob URL). */
  fetchFileObjectUrl: async (file: FileRecord) => {
    const response = await fetch(`${BASE}/files/${file.id}`, { credentials: 'include' });
    if (!response.ok) throw new ApiError('Ficheiro indisponível.', response.status);
    return URL.createObjectURL(await response.blob());
  },
};
