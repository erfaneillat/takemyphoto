export interface Admin {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface CreateAdminDTO {
  email: string;
  password: string;
  name: string;
}
