import { CreatePreInvoiceUseCase } from '../CreatePreInvoiceUseCase';
import { IPreInvoiceRepository } from '../../../../core/domain/repositories/IPreInvoiceRepository';
import { IShopRepository } from '../../../../core/domain/repositories/IShopRepository';
import { PreInvoiceStatus } from '../../../../core/domain/entities/PreInvoice';

describe('CreatePreInvoiceUseCase', () => {
    let useCase: CreatePreInvoiceUseCase;
    let mockPreInvoiceRepo: jest.Mocked<IPreInvoiceRepository>;
    let mockShopRepo: jest.Mocked<IShopRepository>;

    beforeEach(() => {
        mockPreInvoiceRepo = {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            findByShopId: jest.fn(),
            findAll: jest.fn()
        };

        mockShopRepo = {
            create: jest.fn(),
            findById: jest.fn(),
            findByLicenseKey: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        } as unknown as jest.Mocked<IShopRepository>;

        useCase = new CreatePreInvoiceUseCase(mockPreInvoiceRepo, mockShopRepo);
    });

    it('should create a pre-invoice when shop exists', async () => {
        const dto = {
            shopId: 'shop-123',
            basePrice: 1000,
            discountPercentage: 10,
            finalPrice: 900,
            creditCount: 10,
            durationMonths: 1,
            accountDetails: 'Test Account'
        };

        mockShopRepo.findById.mockResolvedValue({ id: 'shop-123', name: 'Test Shop' } as any);
        mockPreInvoiceRepo.create.mockResolvedValue({ id: 'pi-123', ...dto, status: PreInvoiceStatus.PENDING, createdAt: new Date() });

        const result = await useCase.execute(dto);

        expect(mockShopRepo.findById).toHaveBeenCalledWith('shop-123');
        expect(mockPreInvoiceRepo.create).toHaveBeenCalledWith({
            ...dto,
            status: PreInvoiceStatus.PENDING,
            shopName: 'Test Shop'
        });
        expect(result.id).toBe('pi-123');
    });

    it('should throw an error if shop does not exist', async () => {
        const dto = {
            shopId: 'non-existent',
            basePrice: 1000,
            discountPercentage: 10,
            finalPrice: 900,
            creditCount: 10,
            durationMonths: 1,
            accountDetails: 'Test Account'
        };

        mockShopRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute(dto)).rejects.toThrow('Shop not found');
        expect(mockPreInvoiceRepo.create).not.toHaveBeenCalled();
    });
});
