export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  PREMIUM = 'premium'
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface User {
  id: string;
  phoneNumber?: string;
  googleId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
  subscription: SubscriptionTier;
  stars: number;
  isVerified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  phoneNumber?: string;
  googleId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
}

export interface UpdateUserDTO {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  googleId?: string;
  profilePicture?: string;
  subscription?: SubscriptionTier;
  stars?: number;
  isVerified?: boolean;
}
