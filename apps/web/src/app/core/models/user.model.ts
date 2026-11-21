export type Gender = 'female' | 'male' | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  gender: Gender;
  avatar_url?: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  gender: Gender;
}

export interface AuthSession {
  token: string;
  user: User;
}
