import { ICharacterRepository } from '@core/domain/repositories/ICharacterRepository';
import { Character } from '@core/domain/entities/Character';

export class GetUserCharactersUseCase {
  constructor(private characterRepository: ICharacterRepository) {}

  async execute(userId: string): Promise<Character[]> {
    return await this.characterRepository.findByUserId(userId);
  }
}
