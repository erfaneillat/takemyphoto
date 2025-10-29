import { ICharacterRepository } from '@core/domain/repositories/ICharacterRepository';
import { Character, CreateCharacterDTO, UpdateCharacterDTO } from '@core/domain/entities/Character';
import { CharacterModel } from '../models/CharacterModel';

export class CharacterRepository implements ICharacterRepository {
  async create(data: CreateCharacterDTO): Promise<Character> {
    // Note: Image upload handling should be done before calling this
    // The data should already contain processed image URLs
    const character = await CharacterModel.create(data);
    return character.toJSON() as Character;
  }

  async findById(id: string): Promise<Character | null> {
    const character = await CharacterModel.findById(id);
    return character ? (character.toJSON() as Character) : null;
  }

  async findByUserId(userId: string): Promise<Character[]> {
    const characters = await CharacterModel.find({ userId }).sort({ createdAt: -1 });
    return characters.map(char => char.toJSON() as Character);
  }

  async update(id: string, data: UpdateCharacterDTO): Promise<Character | null> {
    const character = await CharacterModel.findByIdAndUpdate(id, data, { new: true });
    return character ? (character.toJSON() as Character) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CharacterModel.findByIdAndDelete(id);
    return !!result;
  }

  async countByUserId(userId: string): Promise<number> {
    return await CharacterModel.countDocuments({ userId });
  }
}
