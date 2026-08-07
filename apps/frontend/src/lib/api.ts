import type {
  User, Product, BmiRecord, Consultation, CartProduct,
  Transaction, Payment, ChatMessage, ChatConversation,
  DashboardStats, PaginationMeta, BmiCategory, BmiResult,
  Recommendation, AdminBmiRecord,
} from '../types/index.js';
export type {
  User, Product, BmiRecord, Consultation, CartProduct,
  Transaction, Payment, ChatMessage, ChatConversation,
  DashboardStats, PaginationMeta, BmiCategory, BmiResult,
  Recommendation, AdminBmiRecord,
};

const BASE = '/api';

const req: <T>(path: string, opts?: RequestInit) => Promise<{ success: boolean; message: string; data?: T; errors?: Record<string, string[]> }> = async <T,>(path: string, opts?: RequestInit) => {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    credentials: 'include',
  });
  const json = await res.json() as { success: boolean; message: string; data?: T; errors?: Record<string, string[]> };
  if (!res.ok || !json.success) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json;
};

// ── Auth ────────────────────────────────────────────────────────────────
export const api = {
  register: (d: { name: string; email: string; phone?: string; password: string }) =>
    req<User>('/auth/register', { method: 'POST', body: JSON.stringify(d) }),
  login: (d: { email: string; password: string }) =>
    req<User>('/auth/login', { method: 'POST', body: JSON.stringify(d) }),
  logout: () => req<void>('/auth/logout', { method: 'POST' }),
  me: () => req<User>('/auth/me'),
};

// ── Profile ─────────────────────────────────────────────────────────────
export const userApi = {
  getMe: () => req<User>('/users/me'),
  updateMe: (d: { name?: string; phone?: string }) =>
    req<User>('/users/me', { method: 'PATCH', body: JSON.stringify(d) }),
};

// ── Products ────────────────────────────────────────────────────────────
export const productsApi = {
  list: (p?: { category?: string; search?: string; includeInactive?: string }) => {
    const q = p ? new URLSearchParams(Object.entries(p).filter(([, v]) => v !== undefined) as [string, string][]).toString() : '';
    return req<Product[]>(`/products${q ? `?${q}` : ''}`);
  },
  getById: (id: string) => req<Product>(`/products/${id}`),
  create: (d: Omit<Product, 'id' | 'pricing'>) =>
    req<Product>('/products', { method: 'POST', body: JSON.stringify(d) }),
  update: (id: string, d: Partial<Product>) =>
    req<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  remove: (id: string) => req<void>(`/products/${id}`, { method: 'DELETE' }),
};

// ── BMI ─────────────────────────────────────────────────────────────────
export const bmiApi = {
  calculate: (d: { weightKg: number; heightCm: number }) =>
    req<BmiRecord>('/bmi/calculate', { method: 'POST', body: JSON.stringify(d) }),
  history: () => req<BmiRecord[]>('/bmi/history'),
};

// ── Consultations ───────────────────────────────────────────────────────
export const consultationApi = {
  create: (d: { question: string }) =>
    req<Consultation>('/consultations', { method: 'POST', body: JSON.stringify(d) }),
  list: () => req<Consultation[]>('/consultations'),
  adminList: () =>
    req<{ records: Consultation[]; pagination: PaginationMeta }>('/consultations/all'),
  adminUpdate: (id: string, d: { response?: string; status?: string }) =>
    req<Consultation>(`/consultations/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
};

// ── Cart ────────────────────────────────────────────────────────────────
export const cartApi = {
  get: () => req<CartProduct[]>('/cart'),
  addItem: (d: { productId: string; quantity: number }) =>
    req<CartProduct[]>('/cart/items', { method: 'POST', body: JSON.stringify(d) }),
  updateItem: (productId: string, quantity: number) =>
    req<CartProduct[]>(`/cart/items/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeItem: (productId: string) =>
    req<CartProduct[]>(`/cart/items/${productId}`, { method: 'DELETE' }),
  clear: () => req<void>('/cart', { method: 'DELETE' }),
};

// ── Transactions ────────────────────────────────────────────────────────
export const transactionApi = {
  create: (items: Array<{ productId: string; quantity: number }>) =>
    req<Transaction>('/transactions', { method: 'POST', body: JSON.stringify({ items }) }),
  list: (p?: { page?: number; limit?: number }) => {
    const q = p ? new URLSearchParams({ page: String(p.page ?? 1), limit: String(p.limit ?? 20) }).toString() : '';
    return req<{ transactions: Transaction[]; pagination: PaginationMeta }>(`/transactions${q ? `?${q}` : ''}`);
  },
  listAll: (p?: { page?: number; limit?: number; status?: string }) => {
    const params = new URLSearchParams();
    if (p?.page) params.append('page', String(p.page));
    if (p?.limit) params.append('limit', String(p.limit));
    if (p?.status) params.append('status', p.status);
    const q = params.toString();
    return req<{ transactions: Transaction[]; pagination: PaginationMeta }>(`/transactions/all${q ? `?${q}` : ''}`);
  },
  updateStatus: (id: string, data: { status: string }) =>
    req<Transaction>(`/transactions/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Payments ────────────────────────────────────────────────────────────
export const paymentApi = {
  create: (d: { transactionId: string; method: string }) =>
    req<Payment>('/payments', { method: 'POST', body: JSON.stringify(d) }),
  simulate: (id: string, action: 'success' | 'failure' | 'expire') =>
    req<Payment>(`/payments/${id}/simulate`, { method: 'POST', body: JSON.stringify({ action }) }),
  list: () => req<Payment[]>('/payments'),
  listAll: (p?: { page?: number; limit?: number; status?: string }) => {
    const params = new URLSearchParams();
    if (p?.page) params.append('page', String(p.page));
    if (p?.limit) params.append('limit', String(p.limit));
    if (p?.status) params.append('status', p.status);
    const q = params.toString();
    return req<{ payments: Payment[]; pagination: PaginationMeta }>(`/payments/all${q ? `?${q}` : ''}`);
  },
  cancel: (id: string) => req<Payment>(`/payments/${id}/cancel`, { method: 'POST' }),
};

// ── Admin ───────────────────────────────────────────────────────────────
export const adminUsersApi = {
  list: (p?: { search?: string; role?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (p?.search) params.append('search', p.search);
    if (p?.role) params.append('role', p.role);
    if (p?.page) params.append('page', p.page.toString());
    if (p?.limit) params.append('limit', p.limit.toString());
    const q = params.toString();
    return req<{ users: User[]; pagination: PaginationMeta }>(`/admin/users${q ? `?${q}` : ''}`);
  },
  update: (id: string, d: { name?: string; phone?: string }) =>
    req<User>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(d) }),
  updateMembership: (id: string, d: { membershipStatus: 'regular' | 'member'; membershipExpiresAt?: string | null }) =>
    req<{ membershipStatus: string; membershipExpiresAt: string | null; membershipActive: boolean }>(
      `/admin/users/${id}/membership`, { method: 'PATCH', body: JSON.stringify(d) }),
  updateStatus: (id: string, d: { isActive: boolean }) =>
    req<{ isActive: boolean }>(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify(d) }),
  deactivate: (id: string) => req<{ isActive: boolean }>(`/admin/users/${id}`, { method: 'DELETE' }),
};

export const statsApi = {
  dashboard: () => req<DashboardStats>('/admin/stats/dashboard'),
};

export const adminBmiApi = {
  list: (p?: { page?: number; limit?: number; search?: string }) => {
    const params = new URLSearchParams();
    if (p?.page) params.append('page', String(p.page));
    if (p?.limit) params.append('limit', String(p.limit));
    if (p?.search) params.append('search', p.search);
    const q = params.toString();
    return req<{ records: AdminBmiRecord[]; pagination: PaginationMeta }>(`/bmi${q ? `?${q}` : ''}`);
  },
};

// ── Chat ────────────────────────────────────────────────────────────────
export const chatApi = {
  createConversation: (d: { customerName: string; category: 'service' | 'complaint' }) =>
    req<ChatConversation>('/chat/conversations', { method: 'POST', body: JSON.stringify(d) }),
  listConversations: () => req<ChatConversation[]>('/chat/conversations'),
  listAllConversations: (p?: { page?: number; limit?: number; status?: string; category?: string }) => {
    const params = new URLSearchParams();
    if (p?.page) params.append('page', String(p.page));
    if (p?.limit) params.append('limit', String(p.limit));
    if (p?.status) params.append('status', p.status);
    if (p?.category) params.append('category', p.category);
    const q = params.toString();
    return req<{ conversations: ChatConversation[]; pagination: PaginationMeta }>(`/chat/conversations/all${q ? `?${q}` : ''}`);
  },
  getMessages: (id: string) => req<ChatMessage[]>(`/chat/conversations/${id}/messages`),
  sendMessage: (id: string, d: { message: string }) =>
    req<ChatMessage>(`/chat/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify(d) }),
  markRead: (id: string) => req<void>(`/chat/conversations/${id}/read`, { method: 'PUT' }),
  close: (id: string) => req<void>(`/chat/conversations/${id}`, { method: 'DELETE' }),
};

// ── Locations ────────────────────────────────────────────────────────────
export interface LocationSchedule {
  id: string;
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  sortOrder: number;
}

export interface Location {
  id: string;
  name: string;
  description: string | null;
  placeId: string | null;
  address: string;
  city: string;
  province: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  mapsUrl: string;
  latitude: number | null;
  longitude: number | null;
  openingHours: Record<string, { open: string; close: string; closed: boolean }> | null;
  isPrimary: boolean;
  isActive: boolean;
  sortOrder: number;
  schedules: LocationSchedule[];
}

export const locationsApi = {
  list: () => req<Location[]>('/locations'),
  getById: (id: string) => req<Location>(`/locations/${id}`),
  getPrimary: () => req<Location | null>('/locations/primary'),
  create: (d: Omit<Location, 'id'>) =>
    req<Location>('/locations', { method: 'POST', body: JSON.stringify(d) }),
  update: (id: string, d: Partial<Location>) =>
    req<Location>(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  remove: (id: string) => req<void>(`/locations/${id}`, { method: 'DELETE' }),
};

export const adminLocationsApi = {
  create: (d: Omit<Location, 'id'>) =>
    req<Location>('/admin/locations', { method: 'POST', body: JSON.stringify(d) }),
  update: (id: string, d: Partial<Location>) =>
    req<Location>(`/admin/locations/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  setStatus: (id: string, isActive: boolean) =>
    req<Location>(`/admin/locations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
  setPrimary: (id: string) =>
    req<Location>(`/admin/locations/${id}/primary`, { method: 'PATCH' }),
  remove: (id: string) => req<void>(`/admin/locations/${id}`, { method: 'DELETE' }),
};

// ── RBAC / Navigation ───────────────────────────────────────────────────────
export interface NavigationItem {
  id: string;
  key: string;
  label: string;
  route: string | null;
  iconKey: string | null;
  section: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
  requiredPermission: string | null;
  audience: string;
  parent: { key: string; label: string; iconKey: string | null; route: string | null } | null;
}

// ── Membership ────────────────────────────────────────────────────────────
export const membershipApi = {
  getStatus: () => req<{ status: string; expiresAt: string | null; isActive: boolean }>('/membership/status'),
  getPlans: () => req<Array<{ id: string; key: string; name: string; description: string | null; fee: number; durationDays: number; discountRate: number; isActive: boolean; isDefault: boolean }>>('/membership/plans'),
  getFee: () => req<{ fee: number }>('/membership/fee'),
  purchase: () => req<{ membershipStatus: string; membershipExpiresAt: string; membershipActive: boolean }>('/membership/purchase', { method: 'POST' }),
};

// ── RBAC / Navigation ───────────────────────────────────────────────────────
export const rbacApi = {
  getNavigation: () => req<NavigationItem[]>('/admin/rbac/navigation'),
};
