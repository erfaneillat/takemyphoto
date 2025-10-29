export interface User {
  id: string;
  phoneNumber?: string;
  googleId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
  createdAt: Date;
  subscription: 'free' | 'pro' | 'premium';
  stars: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  phoneNumber: string;
}

export interface VerificationData {
  phoneNumber: string;
  code: string;
}
