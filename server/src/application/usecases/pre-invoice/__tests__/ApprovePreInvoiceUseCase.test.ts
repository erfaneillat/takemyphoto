import { ApprovePreInvoiceUseCase } from '../ApprovePreInvoiceUseCase';
import { IPreInvoiceRepository } from '../../../../core/domain/repositories/IPreInvoiceRepository';
import { IShopRepository } from '../../../../core/domain/repositories/IShopRepository';
import { PreInvoiceStatus } from '../../../../core/domain/entities/PreInvoice';

describe('ApprovePreInvoiceUseCase', () => {
    let useCase: ApprovePreInvoiceUseCase;
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

        useCase = new ApprovePreInvoiceUseCase(mockPreInvoiceRepo, mockShopRepo);
    });

    it('should approve a pre-invoice and update the shop', async () => {
        mockPreInvoiceRepo.findById.mockResolvedValue({
            id: 'pi-123',
            shopId: 'shop-123',
            status: PreInvoiceStatus.PAID,
            creditCount: 700,
            durationMonths: 12,
            basePrice: 1000,
            discountPercentage: 10,
            finalPrice: 900,
            accountDetails: 'Test Account',
            createdAt: new Date()
        });

        mockPreInvoiceRepo.update.mockResolvedValue({
            id: 'pi-123',
            shopId: 'shop-123',
            status: PreInvoiceStatus.APPROVED,
            creditCount: 700,
            durationMonths: 12,
            basePrice: 1000,
            discountPercentage: 10,
            finalPrice: 900,
            accountDetails: 'Test Account',
            createdAt: new Date()
        });

        await useCase.execute('pi-123');

        expect(mockPreInvoiceRepo.findById).toHaveBeenCalledWith('pi-123');
        expect(mockShopRepo.update).toHaveBeenCalledWith('shop-123', {
            isActivated: true,
            credit: 700,
            licenseDurationMonths: 12
        });
        expect(mockPreInvoiceRepo.update).toHaveBeenCalledWith('pi-123', { status: PreInvoiceStatus.APPROVED });
    });

    it('should throw an error if invoice not found', async () => {
        mockPreInvoiceRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute('invalid-id')).rejects.toThrow('Pre-invoice not found');
        expect(mockShopRepo.update).not.toHaveBeenCalled();
    });
});
