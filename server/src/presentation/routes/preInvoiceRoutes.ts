import { Router } from 'express';
import { PreInvoiceController } from '../controllers/PreInvoiceController';
import { CreatePreInvoiceUseCase } from '../../application/usecases/pre-invoice/CreatePreInvoiceUseCase';
import { GetPreInvoicesUseCase } from '../../application/usecases/pre-invoice/GetPreInvoicesUseCase';
import { UploadReceiptUseCase } from '../../application/usecases/pre-invoice/UploadReceiptUseCase';
import { ApprovePreInvoiceUseCase } from '../../application/usecases/pre-invoice/ApprovePreInvoiceUseCase';
import { PreInvoiceRepository } from '../../infrastructure/database/repositories/PreInvoiceRepository';
import { ShopRepository } from '../../infrastructure/database/repositories/ShopRepository';
import { ZarinpalService } from '../../application/services/ZarinpalService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const createPreInvoiceRoutes = (): Router => {
    const router = Router();

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'dist/uploads');
    fs.mkdirSync(uploadsDir, { recursive: true });

    // Setup multer for receipt uploads
    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, 'dist/uploads/');
        },
        filename: (_req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

    const upload = multer({
        storage: storage,
        fileFilter: (_req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only images are allowed'));
            }
        }
    });

    // Repositories
    const preInvoiceRepository = new PreInvoiceRepository();
    const shopRepository = new ShopRepository();

    // Use Cases
    const createUseCase = new CreatePreInvoiceUseCase(preInvoiceRepository, shopRepository);
    const getUseCase = new GetPreInvoicesUseCase(preInvoiceRepository);
    const uploadUseCase = new UploadReceiptUseCase(preInvoiceRepository);
    const approveUseCase = new ApprovePreInvoiceUseCase(preInvoiceRepository, shopRepository);

    // Zarinpal Service (nullable if not configured)
    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    const isSandbox = process.env.ZARINPAL_SANDBOX === 'true';
    const zarinpalService = merchantId ? new ZarinpalService(merchantId, isSandbox) : null;

    if (zarinpalService) {
        console.log(`💳 Zarinpal configured (sandbox: ${isSandbox})`);
    } else {
        console.log('⚠️  Zarinpal not configured (ZARINPAL_MERCHANT_ID not set)');
    }

    // Controller
    const controller = new PreInvoiceController(
        createUseCase,
        getUseCase,
        uploadUseCase,
        approveUseCase,
        zarinpalService,
        preInvoiceRepository,
        shopRepository
    );

    // Admin routes
    router.post('/admin/pre-invoices', controller.create);
    router.get('/admin/pre-invoices', controller.getAll);
    router.post('/admin/pre-invoices/:invoiceId/approve', controller.approve);

    // Shop specific routes
    router.get('/shops/:shopId/pre-invoices', controller.getByShopId);
    router.post('/shops/:shopId/pre-invoices/:invoiceId/receipt', upload.single('receipt'), controller.uploadReceipt);

    // Zarinpal payment routes
    router.post('/shops/:shopId/pre-invoices/:invoiceId/pay', controller.payWithZarinpal);
    router.get('/pre-invoices/zarinpal/verify', controller.verifyZarinpalPayment);

    return router;
};
