import { Character, CreateCharacterDTO, UpdateCharacterDTO } from '../entities/Character';

export interface ICharacterRepository {
  create(data: CreateCharacterDTO): Promise<Character>;
  findById(id: string): Promise<Character | null>;
  findByUserId(userId: string): Promise<Character[]>;
  update(id: string, data: UpdateCharacterDTO): Promise<Character | null>;
  delete(id: string): Promise<boolean>;
  countByUserId(userId: string): Promise<number>;
}
