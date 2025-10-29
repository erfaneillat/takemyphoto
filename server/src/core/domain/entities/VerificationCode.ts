export interface VerificationCode {
  id: string;
  phoneNumber: string;
  code: string;
  expiresAt: Date;
  isUsed: boolean;
  attempts: number;
  createdAt: Date;
}

export interface CreateVerificationCodeDTO {
  phoneNumber: string;
  code: string;
  expiresAt: Date;
}
