import { IShopRepository } from '@core/domain/repositories/IShopRepository';
import { CreateShopDTO, Shop } from '@core/domain/entities/Shop';
import crypto from 'crypto';

export class CreateShopUseCase {
    constructor(private shopRepository: IShopRepository) { }

    private generateLicenseKey(): string {
        // Generate 8-character uppercase alphanumeric key
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars: 0/O, 1/I
        let key = '';
        const bytes = crypto.randomBytes(8);
        for (let i = 0; i < 8; i++) {
            key += chars[bytes[i] % chars.length];
        }
        return key;
    }

    async execute(data: CreateShopDTO): Promise<Shop> {
        const licenseKey = this.generateLicenseKey();

        return await this.shopRepository.create({
            ...data,
            licenseKey
        });
    }
}
