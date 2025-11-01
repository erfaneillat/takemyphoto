export enum ContactStatus {
  UNREAD = 'unread',
  READ = 'read',
  REPLIED = 'replied',
  ARCHIVED = 'archived'
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactMessageDTO {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface UpdateContactMessageDTO {
  status?: ContactStatus;
}
