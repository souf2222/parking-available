import type { Availability, AuthResponse, LoginCredentials, RegisterData } from '../types';

const API_BASE = '/api/v1';

async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || 'An error occurred');
  }

  return response.json();
}

export const authService = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> => {
    return fetchWithAuth<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: (data: RegisterData): Promise<{ user: { id: number; username: string; role: string } }> => {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const availabilityService = {
  getMonthly: (year: number, month: number, token: string): Promise<{ availability: Availability[] }> => {
    return fetchWithAuth(`/availability/${year}/${month}`, {}, token);
  },

  getByDate: (date: string, token: string): Promise<{ availability: Availability }> => {
    return fetchWithAuth(`/availability/${date}`, {}, token);
  },

  create: (
    date: string,
    status: Availability['status'],
    note: string | undefined,
    token: string
  ): Promise<{ availability: Availability }> => {
    return fetchWithAuth('/availability', {
      method: 'POST',
      body: JSON.stringify({ date, status, note }),
    }, token);
  },

  delete: (date: string, token: string): Promise<{ message: string }> => {
    return fetchWithAuth(`/availability/${date}`, {
      method: 'DELETE',
    }, token);
  },
};
