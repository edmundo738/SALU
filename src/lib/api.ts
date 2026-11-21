/**
 * SALU API Client
 * Comunicação direta com a API backend (porta 3001 via proxy /api)
 */

const BASE = '/api';

export interface ApiUser {
  id: string;
  name: string;
  email_or_phone: string;
  role: 'customer' | 'provider';
  municipality: string;
  profession?: string;
  avatar_url?: string;
  bio?: string;
  rating?: number;
  reviews_count?: number;
}

export interface ApiRequest {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  category: string;
  municipality: string;
  description: string;
  budget_type: 'FIXED' | 'INSPECTION_NEEDED';
  budget_amount: number;
  urgency: 'NORMAL' | 'URGENT';
  status: 'OPEN' | 'IN_NEGOTIATION' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
  whatsapp_negotiated: number;
  whatsapp_screenshot?: string;
  proposals_count?: number;
  created_at: string;
}

export interface ApiProposal {
  id: string;
  request_id: string;
  provider_id: string;
  provider_name: string;
  provider_profession: string;
  provider_avatar?: string;
  amount: number;
  is_inspection_needed: number;
  estimated_days: number;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
}

export interface ApiConversation {
  id: string;
  request_id: string;
  customer_id: string;
  provider_id: string;
  last_message?: string;
  last_message_at?: string;
  request_title?: string;
  customer_name?: string;
  customer_avatar?: string;
  provider_name?: string;
  provider_profession?: string;
  provider_avatar?: string;
}

export interface ApiMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'customer' | 'provider';
  recipient_id: string;
  text: string;
  attachment_url?: string;
  created_at: string;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Servidor backend indisponível ou rota não formatada em JSON.');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erro na requisição ao servidor.');
  }
  return data;
}

export const saluApi = {
  // 1. Auth
  async register(data: {
    name: string;
    email_or_phone: string;
    password: string;
    role?: 'customer' | 'provider';
    municipality?: string;
    profession?: string;
    bio?: string;
  }): Promise<{ success: boolean; user: ApiUser }> {
    return fetchJson(`${BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: {
    email_or_phone: string;
    password: string;
  }): Promise<{ success: boolean; user: ApiUser }> {
    return fetchJson(`${BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async googleAuth(data: {
    name?: string;
    email?: string;
    role?: 'customer' | 'provider';
  }): Promise<{ success: boolean; user: ApiUser }> {
    return fetchJson(`${BASE}/auth/google`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 2. Providers
  async getProviders(params?: {
    municipality?: string;
    category?: string;
    search?: string;
  }): Promise<{ success: boolean; providers: ApiUser[] }> {
    const query = new URLSearchParams();
    if (params?.municipality) query.set('municipality', params.municipality);
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    return fetchJson(`${BASE}/providers?${query.toString()}`);
  },

  // 3. Requests
  async getRequests(params?: {
    category?: string;
    municipality?: string;
    user_id?: string;
    status?: string;
  }): Promise<{ success: boolean; requests: ApiRequest[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.municipality) query.set('municipality', params.municipality);
    if (params?.user_id) query.set('user_id', params.user_id);
    if (params?.status) query.set('status', params.status);
    return fetchJson(`${BASE}/requests?${query.toString()}`);
  },

  async getRequestById(id: string): Promise<{
    success: boolean;
    request: ApiRequest;
    proposals: ApiProposal[];
    agreement?: any;
  }> {
    return fetchJson(`${BASE}/requests/${encodeURIComponent(id)}`);
  },

  async createRequest(data: {
    user_id: string;
    user_name: string;
    title: string;
    category: string;
    municipality: string;
    description: string;
    budget_type: 'FIXED' | 'INSPECTION_NEEDED';
    budget_amount: number;
    urgency: 'NORMAL' | 'URGENT';
  }): Promise<{ success: boolean; request: ApiRequest }> {
    return fetchJson(`${BASE}/requests`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 4. Proposals
  async submitProposal(
    requestId: string,
    data: {
      provider_id: string;
      provider_name: string;
      provider_profession?: string;
      amount: number;
      is_inspection_needed: boolean;
      estimated_days: number;
      message: string;
    }
  ): Promise<{ success: boolean; proposal: ApiProposal }> {
    return fetchJson(`${BASE}/requests/${encodeURIComponent(requestId)}/proposals`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        is_inspection_needed: data.is_inspection_needed ? 1 : 0,
      }),
    });
  },

  async acceptProposal(proposalId: string): Promise<{
    success: boolean;
    message: string;
    agreementId: string;
  }> {
    return fetchJson(`${BASE}/proposals/${encodeURIComponent(proposalId)}/accept`, {
      method: 'POST',
    });
  },

  // 5. Escrow & Agreements
  async releaseEscrow(agreementId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return fetchJson(`${BASE}/agreements/${encodeURIComponent(agreementId)}/release-escrow`, {
      method: 'POST',
    });
  },

  async confirmWhatsAppAgreement(data: {
    request_id: string;
    customer_id: string;
    provider_id: string;
    agreed_amount: number;
    screenshot_url?: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string; agreementId: string }> {
    return fetchJson(`${BASE}/agreements/whatsapp-confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 6. Messages & Conversations
  async getConversations(userId: string): Promise<{
    success: boolean;
    conversations: ApiConversation[];
  }> {
    return fetchJson(`${BASE}/conversations?user_id=${encodeURIComponent(userId)}`);
  },

  async getMessages(
    convId: string,
    requesterId?: string
  ): Promise<{ success: boolean; messages: ApiMessage[] }> {
    const query = requesterId ? `?requester_id=${encodeURIComponent(requesterId)}` : '';
    return fetchJson(`${BASE}/conversations/${encodeURIComponent(convId)}/messages${query}`);
  },

  async sendMessage(
    convId: string,
    data: {
      sender_id: string;
      sender_name: string;
      sender_role: 'customer' | 'provider';
      recipient_id?: string;
      text: string;
      attachment_url?: string;
    }
  ): Promise<{ success: boolean; messageId: string; timestamp: string }> {
    return fetchJson(`${BASE}/conversations/${encodeURIComponent(convId)}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 7. Upload
  async uploadFile(base64Data: string, filename?: string): Promise<{ success: boolean; url: string }> {
    return fetchJson(`${BASE}/upload`, {
      method: 'POST',
      body: JSON.stringify({ base64Data, filename }),
    });
  },

  // 8. Bots
  async getBotsStatus(): Promise<{ success: boolean; enabled: boolean }> {
    return fetchJson(`${BASE}/bots/status`);
  },

  async toggleBots(): Promise<{ success: boolean; enabled: boolean }> {
    return fetchJson(`${BASE}/bots/toggle`, { method: 'POST' });
  },

  async triggerBotNow(): Promise<{ success: boolean; result: any }> {
    return fetchJson(`${BASE}/bots/trigger-now`, { method: 'POST' });
  },
};
