export interface Availability {
  id: number;
  date: string;
  status: 'available' | 'unavailable' | 'partial';
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  role: 'owner' | 'neighbor';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  role?: 'owner' | 'neighbor';
}

export interface AvailabilityUpdate {
  date: string;
  status: 'available' | 'unavailable' | 'partial';
  note?: string;
}
