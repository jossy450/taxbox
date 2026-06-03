const API_BASE = '/api';

async function request(method: string, path: string, body?: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function getToken(): string | null {
  try {
    const stored = localStorage.getItem('taxbox_api_session');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

export function setSession(user: unknown, token: string) {
  localStorage.setItem('taxbox_api_session', JSON.stringify({ user, token }));
}

export function clearSession() {
  localStorage.removeItem('taxbox_api_session');
}

export function getStoredUser() {
  try {
    const stored = localStorage.getItem('taxbox_api_session');
    if (!stored) return null;
    return JSON.parse(stored)?.user || null;
  } catch {
    return null;
  }
}

export async function apiLogin(email: string, password: string) {
  return request('POST', '/auth/login', { email, password });
}

export async function apiRegister(data: { name: string; email: string; password: string; role: string; company?: string }) {
  return request('POST', '/auth/register', data);
}

export async function apiGoogleLogin(data: { email: string; name: string; googleId: string }) {
  return request('POST', '/auth/google', data);
}

export async function apiGetMe(token: string) {
  return request('GET', '/auth/me', undefined, token);
}

export async function apiForgotPassword(email: string) {
  return request('POST', '/password/forgot', { email });
}

export async function apiResetPassword(token: string, password: string) {
  return request('POST', '/password/reset', { token, password });
}

export async function apiChatAsk(question: string, token: string | null, contact?: { name?: string; email?: string; phone?: string }) {
  return request('POST', '/chatbot/ask', { question, ...contact }, token ?? undefined);
}

export async function apiGetFaqs(token: string) {
  return request('GET', '/chatbot/faq', undefined, token);
}

export async function apiSeedFaqs(faqs: unknown[], token: string) {
  return request('POST', '/chatbot/faq/seed', { faqs }, token);
}

export async function apiCreateFaq(data: { question: string; answer: string; category?: string }, token: string) {
  return request('POST', '/chatbot/faq', data, token);
}

export async function apiUpdateFaq(id: string, data: { question?: string; answer?: string; category?: string }, token: string) {
  return request('PUT', `/chatbot/faq/${id}`, data, token);
}

export async function apiDeleteFaq(id: string, token: string) {
  return request('DELETE', `/chatbot/faq/${id}`, undefined, token);
}

export async function apiGetChatLogs(token: string, status?: string) {
  const qs = status ? `?status=${status}` : '';
  return request('GET', `/chatbot/logs${qs}`, undefined, token);
}

export async function apiUpdateChatLog(id: string, data: { status?: string; answer?: string }, token: string) {
  return request('PATCH', `/chatbot/logs/${id}`, data, token);
}
