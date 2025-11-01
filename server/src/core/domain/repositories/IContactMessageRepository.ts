import { ContactMessage, CreateContactMessageDTO, UpdateContactMessageDTO } from '../entities/ContactMessage';

export interface IContactMessageRepository {
  create(data: CreateContactMessageDTO): Promise<ContactMessage>;
  findById(id: string): Promise<ContactMessage | null>;
  findAll(page: number, limit: number): Promise<{ messages: ContactMessage[]; total: number }>;
  update(id: string, data: UpdateContactMessageDTO): Promise<ContactMessage | null>;
  delete(id: string): Promise<boolean>;
}
