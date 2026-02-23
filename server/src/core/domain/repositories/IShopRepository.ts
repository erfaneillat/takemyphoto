import { Shop, CreateShopDTO } from '../entities/Shop';

export interface IShopRepository {
    create(data: CreateShopDTO & { licenseKey: string }): Promise<Shop>;
    findAll(): Promise<Shop[]>;
    findById(id: string): Promise<Shop | null>;
    findByLicenseKey(licenseKey: string): Promise<Shop | null>;
    update(id: string, data: Partial<Shop>): Promise<Shop | null>;
    delete(id: string): Promise<boolean>;
    incrementGenerationCount(id: string): Promise<void>;
    decrementCredit(id: string, amount?: number): Promise<void>;
}
