// Repositories
import { UserRepository } from '@infrastructure/database/repositories/UserRepository';
import { CharacterRepository } from '@infrastructure/database/repositories/CharacterRepository';
import { TemplateRepository } from '@infrastructure/database/repositories/TemplateRepository';
import { GeneratedImageRepository } from '@infrastructure/database/repositories/GeneratedImageRepository';
import { FavoriteTemplateRepository } from '@infrastructure/database/repositories/FavoriteTemplateRepository';
import { VerificationCodeRepository } from '@infrastructure/database/repositories/VerificationCodeRepository';
import { CategoryRepository } from '@infrastructure/database/repositories/CategoryRepository';
import { GenerationTaskRepository } from '@infrastructure/database/repositories/GenerationTaskRepository';
import { GeneratedImageEntityRepository } from '@infrastructure/database/repositories/GeneratedImageEntityRepository';
import { AdminRepository } from '@infrastructure/database/repositories/AdminRepository';
import { StyleUsageRepository } from '@infrastructure/database/repositories/StyleUsageRepository';
import { ContactMessageRepository } from '@infrastructure/database/repositories/ContactMessageRepository';
import { CheckoutOrderRepository } from '@infrastructure/database/repositories/CheckoutOrderRepository';
import { PaymentRepository } from '@infrastructure/database/repositories/PaymentRepository';
import { ErrorLogRepository } from '@infrastructure/database/repositories/ErrorLogRepository';
import { ShopRepository } from '@infrastructure/database/repositories/ShopRepository';
import { ShopCategoryRepository } from '@infrastructure/database/repositories/ShopCategoryRepository';
import { ShopStyleRepository } from '@infrastructure/database/repositories/ShopStyleRepository';

// Services
import { JwtService } from '@infrastructure/services/JwtService';
import { LocalFileUploadService } from '@infrastructure/services/LocalFileUploadService';
import { MockSmsService, ISmsService } from '@infrastructure/services/SmsService';
import { KavenegarService } from '@infrastructure/services/KavenegarService';
import { OpenAIService } from '@infrastructure/services/OpenAIService';
import { GoogleAIService } from '@infrastructure/services/GoogleAIService';
import { RemoteImageService } from '@infrastructure/services/RemoteImageService';
import { ErrorLogService } from '@application/services/ErrorLogService';
import { YekpayService } from '@application/services/YekpayService';
import { ZarinpalService } from '@application/services/ZarinpalService';

// Use Cases
import { SendVerificationCodeUseCase } from '@application/usecases/auth/SendVerificationCodeUseCase';
import { VerifyCodeUseCase } from '@application/usecases/auth/VerifyCodeUseCase';
import { GoogleAuthUseCase } from '@application/usecases/auth/GoogleAuthUseCase';
import { AdminLoginUseCase } from '@application/usecases/auth/AdminLoginUseCase';
import { CreateCharacterUseCase } from '@application/usecases/character/CreateCharacterUseCase';
import { GetUserCharactersUseCase } from '@application/usecases/character/GetUserCharactersUseCase';
import { DeleteCharacterUseCase } from '@application/usecases/character/DeleteCharacterUseCase';
import { UpdateCharacterUseCase } from '@application/usecases/character/UpdateCharacterUseCase';
import { GetTemplatesUseCase } from '@application/usecases/template/GetTemplatesUseCase';
import { GetTemplatesWithFavoritesUseCase } from '@application/usecases/template/GetTemplatesWithFavoritesUseCase';
import { ToggleFavoriteTemplateUseCase } from '@application/usecases/template/ToggleFavoriteTemplateUseCase';
import { GetUserFavoritesUseCase } from '@application/usecases/template/GetUserFavoritesUseCase';
import { CreateTemplateUseCase } from '@application/usecases/template/CreateTemplateUseCase';
import { UpdateTemplateUseCase } from '@application/usecases/template/UpdateTemplateUseCase';
import { DeleteTemplateUseCase } from '@application/usecases/template/DeleteTemplateUseCase';
import { ImportTemplatesUseCase } from '@application/usecases/template/ImportTemplatesUseCase';
import { SyncTemplateStatsUseCase } from '@application/usecases/template/SyncTemplateStatsUseCase';
import { GetPopularStylesUseCase } from '@application/usecases/template/GetPopularStylesUseCase';
import { CreateCategoryUseCase } from '@application/usecases/category/CreateCategoryUseCase';
import { GetCategoriesUseCase } from '@application/usecases/category/GetCategoriesUseCase';
import { UpdateCategoryUseCase } from '@application/usecases/category/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '@application/usecases/category/DeleteCategoryUseCase';
import { GetUserProfileUseCase } from '@application/usecases/user/GetUserProfileUseCase';
import { GetUsersUseCase } from '@application/usecases/user/GetUsersUseCase';
import { GetUserStatsUseCase } from '@application/usecases/user/GetUserStatsUseCase';
import { UpdateUserUseCase } from '@application/usecases/user/UpdateUserUseCase';
import { DeleteUserUseCase } from '@application/usecases/user/DeleteUserUseCase';
import { UpscaleImageUseCase as AIUpscaleImageUseCase } from '@application/usecases/upscale/UpscaleImageUseCase';
import { UpscaleImageUseCase } from '@application/usecases/enhance/UpscaleImageUseCase';
import { ImageToPromptUseCase } from '@application/usecases/enhance/ImageToPromptUseCase';
import { GenerateImageUseCase } from '@application/usecases/nanobanana/GenerateImageUseCase';
import { EditImageUseCase } from '@application/usecases/nanobanana/EditImageUseCase';
import { GetDashboardStatsUseCase } from '@application/usecases/dashboard/GetDashboardStatsUseCase';
import { GetGeneratedImagesUseCase } from '@application/usecases/dashboard/GetGeneratedImagesUseCase';
import { CreateContactMessageUseCase } from '@application/usecases/contact/CreateContactMessageUseCase';
import { GetContactMessagesUseCase } from '@application/usecases/contact/GetContactMessagesUseCase';
import { UpdateContactMessageStatusUseCase } from '@application/usecases/contact/UpdateContactMessageStatusUseCase';
import { DeleteContactMessageUseCase } from '@application/usecases/contact/DeleteContactMessageUseCase';
import { CreateCheckoutOrderUseCase } from '@application/usecases/checkout/CreateCheckoutOrderUseCase';
import { GetCheckoutOrdersUseCase } from '@application/usecases/checkout/GetCheckoutOrdersUseCase';
import { UpdateCheckoutOrderStatusUseCase } from '@application/usecases/checkout/UpdateCheckoutOrderStatusUseCase';
import { DeleteCheckoutOrderUseCase } from '@application/usecases/checkout/DeleteCheckoutOrderUseCase';
import { CreatePaymentUseCase } from '@application/usecases/payment/CreatePaymentUseCase';
import { InitiatePaymentUseCase } from '@application/usecases/payment/InitiatePaymentUseCase';
import { VerifyPaymentUseCase } from '@application/usecases/payment/VerifyPaymentUseCase';
import { GetPaymentsUseCase } from '@application/usecases/payment/GetPaymentsUseCase';
import { CreateErrorLogUseCase } from '@application/usecases/error-log/CreateErrorLogUseCase';
import { GetErrorLogsUseCase } from '@application/usecases/error-log/GetErrorLogsUseCase';
import { GetErrorLogStatsUseCase } from '@application/usecases/error-log/GetErrorLogStatsUseCase';
import { UpdateErrorLogUseCase } from '@application/usecases/error-log/UpdateErrorLogUseCase';
import { DeleteErrorLogUseCase } from '@application/usecases/error-log/DeleteErrorLogUseCase';
import { DeleteManyErrorLogsUseCase } from '@application/usecases/error-log/DeleteManyErrorLogsUseCase';
import { GenerateThumbnailUseCase } from '@application/usecases/tools/GenerateThumbnailUseCase';
import { GenerateProductImageUseCase } from '@application/usecases/tools/GenerateProductImageUseCase';
import { GenerateShopProductImageUseCase } from '@application/usecases/tools/GenerateShopProductImageUseCase';
import { InitiateZarinpalPaymentUseCase } from '@application/usecases/payment/InitiateZarinpalPaymentUseCase';
import { VerifyZarinpalPaymentUseCase } from '@application/usecases/payment/VerifyZarinpalPaymentUseCase';
import { CreateShopUseCase } from '@application/usecases/shop/CreateShopUseCase';
import { GetShopsUseCase } from '@application/usecases/shop/GetShopsUseCase';
import { DeleteShopUseCase } from '@application/usecases/shop/DeleteShopUseCase';
import { ActivateLicenseUseCase } from '@application/usecases/shop/ActivateLicenseUseCase';
import { ValidateLicenseUseCase } from '@application/usecases/shop/ValidateLicenseUseCase';
import { RegenerateShopLicenseUseCase } from '@application/usecases/shop/RegenerateShopLicenseUseCase';
import { CreateShopCategoryUseCase } from '@application/usecases/shop-category/CreateShopCategoryUseCase';
import { GetShopCategoriesUseCase } from '@application/usecases/shop-category/GetShopCategoriesUseCase';
import { UpdateShopCategoryUseCase } from '@application/usecases/shop-category/UpdateShopCategoryUseCase';
import { DeleteShopCategoryUseCase } from '@application/usecases/shop-category/DeleteShopCategoryUseCase';
import { CreateShopStyleUseCase } from '@application/usecases/shop-style/CreateShopStyleUseCase';
import { GetShopStylesUseCase } from '@application/usecases/shop-style/GetShopStylesUseCase';
import { UpdateShopStyleUseCase } from '@application/usecases/shop-style/UpdateShopStyleUseCase';
import { DeleteShopStyleUseCase } from '@application/usecases/shop-style/DeleteShopStyleUseCase';

// GetTaskStatusUseCase and HandleCallbackUseCase removed - no longer needed with synchronous Google AI API

// Controllers
import { AuthController } from '@presentation/controllers/AuthController';
import { CharacterController } from '@presentation/controllers/CharacterController';
import { TemplateController } from '@presentation/controllers/TemplateController';
import { UserController } from '@presentation/controllers/UserController';
import { CategoryController } from '@presentation/controllers/CategoryController';
import { AdminTemplateController } from '@presentation/controllers/AdminTemplateController';
import { EnhanceController } from '@presentation/controllers/EnhanceController';
import { ImageGenerationController } from '@presentation/controllers/NanoBananaController';
import { ThumbnailController } from '@presentation/controllers/ThumbnailController';
import { DashboardController } from '@presentation/controllers/DashboardController';
import { ContactController } from '@presentation/controllers/ContactController';
import { CheckoutController } from '@presentation/controllers/CheckoutController';
import { ErrorLogController } from '@presentation/controllers/ErrorLogController';
import { UpscaleController } from '@presentation/controllers/UpscaleController';
import { ZarinpalController } from '@presentation/controllers/ZarinpalController';
import { ProductImageController } from '@presentation/controllers/ProductImageController';
import { ShopProductImageController } from '@presentation/controllers/ShopProductImageController';
import { ShopController } from '@presentation/controllers/ShopController';
import { ShopCategoryController } from '@presentation/controllers/ShopCategoryController';
import { ShopStyleController } from '@presentation/controllers/ShopStyleController';

export class Container {
  // Repositories
  public userRepository: UserRepository;
  public characterRepository: CharacterRepository;
  public templateRepository: TemplateRepository;
  public generatedImageRepository: GeneratedImageRepository;
  public favoriteTemplateRepository: FavoriteTemplateRepository;
  public verificationCodeRepository: VerificationCodeRepository;
  public categoryRepository: CategoryRepository;
  public generationTaskRepository: GenerationTaskRepository;
  public generatedImageEntityRepository: GeneratedImageEntityRepository;
  public adminRepository: AdminRepository;
  public styleUsageRepository: StyleUsageRepository;
  public contactMessageRepository: ContactMessageRepository;
  public checkoutOrderRepository: CheckoutOrderRepository;
  public paymentRepository: PaymentRepository;
  public errorLogRepository: ErrorLogRepository;
  public shopRepository: ShopRepository;
  public shopCategoryRepository: ShopCategoryRepository;
  public shopStyleRepository: ShopStyleRepository;

  // Services
  public jwtService: JwtService;
  public fileUploadService: LocalFileUploadService;
  public smsService: ISmsService;
  public openAIService: OpenAIService;
  public googleAIService: GoogleAIService;
  public remoteImageService: RemoteImageService;
  public errorLogService: ErrorLogService;
  public yekpayService: YekpayService;
  public zarinpalService: ZarinpalService;

  // Use Cases
  public sendVerificationCodeUseCase: SendVerificationCodeUseCase;
  public verifyCodeUseCase: VerifyCodeUseCase;
  public googleAuthUseCase: GoogleAuthUseCase;
  public adminLoginUseCase: AdminLoginUseCase;
  public createCharacterUseCase: CreateCharacterUseCase;
  public getUserCharactersUseCase: GetUserCharactersUseCase;
  public deleteCharacterUseCase: DeleteCharacterUseCase;
  public updateCharacterUseCase: UpdateCharacterUseCase;
  public getTemplatesUseCase: GetTemplatesUseCase;
  public getTemplatesWithFavoritesUseCase: GetTemplatesWithFavoritesUseCase;
  public toggleFavoriteTemplateUseCase: ToggleFavoriteTemplateUseCase;
  public getUserFavoritesUseCase: GetUserFavoritesUseCase;
  public createTemplateUseCase: CreateTemplateUseCase;
  public updateTemplateUseCase: UpdateTemplateUseCase;
  public deleteTemplateUseCase: DeleteTemplateUseCase;
  public importTemplatesUseCase: ImportTemplatesUseCase;
  public syncTemplateStatsUseCase: SyncTemplateStatsUseCase;
  public getPopularStylesUseCase: GetPopularStylesUseCase;
  public createCategoryUseCase: CreateCategoryUseCase;
  public getCategoriesUseCase: GetCategoriesUseCase;
  public updateCategoryUseCase: UpdateCategoryUseCase;
  public deleteCategoryUseCase: DeleteCategoryUseCase;
  public getUserProfileUseCase: GetUserProfileUseCase;
  public getUsersUseCase: GetUsersUseCase;
  public getUserStatsUseCase: GetUserStatsUseCase;
  public updateUserUseCase: UpdateUserUseCase;
  public deleteUserUseCase: DeleteUserUseCase;
  public upscaleImageUseCase: UpscaleImageUseCase;
  public aiUpscaleImageUseCase: AIUpscaleImageUseCase;
  public imageToPromptUseCase: ImageToPromptUseCase;
  public generateImageUseCase: GenerateImageUseCase;
  public editImageUseCase: EditImageUseCase;
  public getDashboardStatsUseCase: GetDashboardStatsUseCase;
  public getGeneratedImagesUseCase: GetGeneratedImagesUseCase;
  public createContactMessageUseCase: CreateContactMessageUseCase;
  public getContactMessagesUseCase: GetContactMessagesUseCase;
  public updateContactMessageStatusUseCase: UpdateContactMessageStatusUseCase;
  public deleteContactMessageUseCase: DeleteContactMessageUseCase;
  public createCheckoutOrderUseCase: CreateCheckoutOrderUseCase;
  public getCheckoutOrdersUseCase: GetCheckoutOrdersUseCase;
  public updateCheckoutOrderStatusUseCase: UpdateCheckoutOrderStatusUseCase;
  public deleteCheckoutOrderUseCase: DeleteCheckoutOrderUseCase;
  public createPaymentUseCase: CreatePaymentUseCase;
  public initiatePaymentUseCase: InitiatePaymentUseCase;
  public verifyPaymentUseCase: VerifyPaymentUseCase;
  public getPaymentsUseCase: GetPaymentsUseCase;
  public createErrorLogUseCase: CreateErrorLogUseCase;
  public getErrorLogsUseCase: GetErrorLogsUseCase;
  public getErrorLogStatsUseCase: GetErrorLogStatsUseCase;
  public updateErrorLogUseCase: UpdateErrorLogUseCase;
  public deleteErrorLogUseCase: DeleteErrorLogUseCase;
  public deleteManyErrorLogsUseCase: DeleteManyErrorLogsUseCase;
  public generateThumbnailUseCase: GenerateThumbnailUseCase;
  public generateProductImageUseCase: GenerateProductImageUseCase;
  public generateShopProductImageUseCase: GenerateShopProductImageUseCase;
  public initiateZarinpalPaymentUseCase: InitiateZarinpalPaymentUseCase;
  public verifyZarinpalPaymentUseCase: VerifyZarinpalPaymentUseCase;
  public createShopUseCase: CreateShopUseCase;
  public getShopsUseCase: GetShopsUseCase;
  public deleteShopUseCase: DeleteShopUseCase;
  public activateLicenseUseCase: ActivateLicenseUseCase;
  public validateLicenseUseCase: ValidateLicenseUseCase;
  public regenerateShopLicenseUseCase: RegenerateShopLicenseUseCase;
  public createShopCategoryUseCase: CreateShopCategoryUseCase;
  public getShopCategoriesUseCase: GetShopCategoriesUseCase;
  public updateShopCategoryUseCase: UpdateShopCategoryUseCase;
  public deleteShopCategoryUseCase: DeleteShopCategoryUseCase;
  public createShopStyleUseCase: CreateShopStyleUseCase;
  public getShopStylesUseCase: GetShopStylesUseCase;
  public updateShopStyleUseCase: UpdateShopStyleUseCase;
  public deleteShopStyleUseCase: DeleteShopStyleUseCase;
  // Task-based use cases removed - synchronous API

  // Controllers
  public authController: AuthController;
  public characterController: CharacterController;
  public templateController: TemplateController;
  public userController: UserController;
  public categoryController: CategoryController;
  public adminTemplateController: AdminTemplateController;
  public enhanceController: EnhanceController;
  public imageGenerationController: ImageGenerationController;
  public thumbnailController: ThumbnailController;
  public dashboardController: DashboardController;
  public contactController: ContactController;
  public checkoutController: CheckoutController;
  public errorLogController: ErrorLogController;
  public upscaleController: UpscaleController;
  public productImageController: ProductImageController;
  public shopProductImageController: ShopProductImageController;
  public zarinpalController: ZarinpalController;
  public shopController: ShopController;
  public shopCategoryController: ShopCategoryController;
  public shopStyleController: ShopStyleController;

  constructor() {
    // Initialize Repositories
    this.userRepository = new UserRepository();
    this.characterRepository = new CharacterRepository();
    this.templateRepository = new TemplateRepository();
    this.generatedImageRepository = new GeneratedImageRepository();
    this.favoriteTemplateRepository = new FavoriteTemplateRepository();
    this.verificationCodeRepository = new VerificationCodeRepository();
    this.categoryRepository = new CategoryRepository();
    this.generationTaskRepository = new GenerationTaskRepository();
    this.generatedImageEntityRepository = new GeneratedImageEntityRepository();
    this.adminRepository = new AdminRepository();
    this.styleUsageRepository = new StyleUsageRepository();
    this.contactMessageRepository = new ContactMessageRepository();
    this.checkoutOrderRepository = new CheckoutOrderRepository();
    this.paymentRepository = new PaymentRepository();
    this.errorLogRepository = new ErrorLogRepository();
    this.shopRepository = new ShopRepository();
    this.shopCategoryRepository = new ShopCategoryRepository();
    this.shopStyleRepository = new ShopStyleRepository();

    // Initialize Services
    this.jwtService = new JwtService();
    this.fileUploadService = new LocalFileUploadService();
    this.openAIService = new OpenAIService();
    this.googleAIService = new GoogleAIService();
    this.remoteImageService = new RemoteImageService();
    // Initialize SMS Service - Use Kavenegar in production, Mock in development
    const kavenegarApiKey = process.env.KAVENEGAR_API_KEY;
    if (kavenegarApiKey) {
      this.smsService = new KavenegarService(kavenegarApiKey);
      console.log('[Container] Using KavenegarService for SMS');
    } else {
      this.smsService = new MockSmsService();
      console.log('[Container] Using MockSmsService for SMS (KAVENEGAR_API_KEY not set)');
    }

    // Initialize Yekpay Service
    const yekpayMerchantId = process.env.YEKPAY_MERCHANT_ID || '';
    const yekpayIsSandbox = process.env.YEKPAY_SANDBOX === 'true';
    this.yekpayService = new YekpayService(yekpayMerchantId, yekpayIsSandbox);

    // Initialize Zarinpal Service
    const zarinpalMerchantId = process.env.ZARINPAL_MERCHANT_ID || '';
    const zarinpalIsSandbox = process.env.ZARINPAL_SANDBOX === 'true';
    this.zarinpalService = new ZarinpalService(zarinpalMerchantId, zarinpalIsSandbox);

    // Initialize Error Logging
    this.createErrorLogUseCase = new CreateErrorLogUseCase(
      this.errorLogRepository
    );
    this.errorLogService = new ErrorLogService(this.createErrorLogUseCase);

    // Initialize Use Cases
    this.sendVerificationCodeUseCase = new SendVerificationCodeUseCase(
      this.verificationCodeRepository,
      this.smsService
    );

    this.verifyCodeUseCase = new VerifyCodeUseCase(
      this.verificationCodeRepository,
      this.userRepository,
      this.jwtService
    );

    this.googleAuthUseCase = new GoogleAuthUseCase(
      this.userRepository,
      this.jwtService
    );

    this.adminLoginUseCase = new AdminLoginUseCase(
      this.adminRepository,
      this.jwtService
    );

    this.createCharacterUseCase = new CreateCharacterUseCase(
      this.characterRepository,
      this.fileUploadService
    );

    this.getUserCharactersUseCase = new GetUserCharactersUseCase(
      this.characterRepository
    );

    this.deleteCharacterUseCase = new DeleteCharacterUseCase(
      this.characterRepository,
      this.fileUploadService
    );

    this.updateCharacterUseCase = new UpdateCharacterUseCase(
      this.characterRepository,
      this.fileUploadService
    );

    this.getTemplatesUseCase = new GetTemplatesUseCase(
      this.templateRepository
    );

    this.getTemplatesWithFavoritesUseCase = new GetTemplatesWithFavoritesUseCase(
      this.templateRepository,
      this.favoriteTemplateRepository
    );

    this.toggleFavoriteTemplateUseCase = new ToggleFavoriteTemplateUseCase(
      this.favoriteTemplateRepository,
      this.templateRepository
    );

    this.getUserFavoritesUseCase = new GetUserFavoritesUseCase(
      this.favoriteTemplateRepository,
      this.templateRepository
    );

    this.getUserProfileUseCase = new GetUserProfileUseCase(
      this.userRepository,
      this.generatedImageRepository,
      this.favoriteTemplateRepository
    );

    this.getUsersUseCase = new GetUsersUseCase(
      this.userRepository
    );

    this.getUserStatsUseCase = new GetUserStatsUseCase(
      this.userRepository
    );

    this.updateUserUseCase = new UpdateUserUseCase(
      this.userRepository
    );

    this.deleteUserUseCase = new DeleteUserUseCase(
      this.userRepository
    );

    this.createTemplateUseCase = new CreateTemplateUseCase(
      this.templateRepository
    );

    this.updateTemplateUseCase = new UpdateTemplateUseCase(
      this.templateRepository
    );

    this.deleteTemplateUseCase = new DeleteTemplateUseCase(
      this.templateRepository
    );

    this.importTemplatesUseCase = new ImportTemplatesUseCase(
      this.templateRepository,
      this.categoryRepository,
      this.styleUsageRepository
    );

    this.syncTemplateStatsUseCase = new SyncTemplateStatsUseCase(
      this.templateRepository,
      this.styleUsageRepository
    );

    this.createCategoryUseCase = new CreateCategoryUseCase(
      this.categoryRepository
    );

    this.getCategoriesUseCase = new GetCategoriesUseCase(
      this.categoryRepository
    );

    this.updateCategoryUseCase = new UpdateCategoryUseCase(
      this.categoryRepository
    );

    this.deleteCategoryUseCase = new DeleteCategoryUseCase(
      this.categoryRepository
    );

    this.upscaleImageUseCase = new UpscaleImageUseCase(
      this.userRepository
    );

    this.aiUpscaleImageUseCase = new AIUpscaleImageUseCase(
      this.googleAIService,
      this.fileUploadService,
      this.errorLogService,
      this.userRepository
    );

    this.imageToPromptUseCase = new ImageToPromptUseCase(
      this.openAIService,
      this.userRepository
    );

    this.generateImageUseCase = new GenerateImageUseCase(
      this.googleAIService,
      this.fileUploadService,
      this.generatedImageEntityRepository,
      this.userRepository,
      this.errorLogService
    );

    this.editImageUseCase = new EditImageUseCase(
      this.googleAIService,
      this.fileUploadService,
      this.generatedImageEntityRepository,
      this.userRepository,
      this.errorLogService
    );

    // Initialize Controllers
    this.authController = new AuthController(
      this.sendVerificationCodeUseCase,
      this.verifyCodeUseCase,
      this.googleAuthUseCase,
      this.adminLoginUseCase
    );

    this.characterController = new CharacterController(
      this.createCharacterUseCase,
      this.getUserCharactersUseCase,
      this.deleteCharacterUseCase,
      this.updateCharacterUseCase
    );

    this.getPopularStylesUseCase = new GetPopularStylesUseCase();

    this.templateController = new TemplateController(
      this.getTemplatesWithFavoritesUseCase,
      this.toggleFavoriteTemplateUseCase,
      this.getUserFavoritesUseCase,
      this.getPopularStylesUseCase
    );

    this.userController = new UserController(
      this.getUserProfileUseCase,
      this.getUsersUseCase,
      this.getUserStatsUseCase,
      this.updateUserUseCase,
      this.deleteUserUseCase,
      this.userRepository
    );

    this.categoryController = new CategoryController(
      this.createCategoryUseCase,
      this.getCategoriesUseCase,
      this.updateCategoryUseCase,
      this.deleteCategoryUseCase
    );

    this.adminTemplateController = new AdminTemplateController(
      this.createTemplateUseCase,
      this.getTemplatesUseCase,
      this.updateTemplateUseCase,
      this.deleteTemplateUseCase,
      this.importTemplatesUseCase,
      this.syncTemplateStatsUseCase,
      this.fileUploadService
    );

    this.enhanceController = new EnhanceController(
      this.upscaleImageUseCase,
      this.imageToPromptUseCase
    );

    this.imageGenerationController = new ImageGenerationController(
      this.generateImageUseCase,
      this.editImageUseCase,
      this.generatedImageEntityRepository
    );

    this.getDashboardStatsUseCase = new GetDashboardStatsUseCase();

    this.getGeneratedImagesUseCase = new GetGeneratedImagesUseCase(
      this.generatedImageEntityRepository,
      this.templateRepository
    );

    this.dashboardController = new DashboardController(
      this.getDashboardStatsUseCase,
      this.getGeneratedImagesUseCase
    );

    this.createContactMessageUseCase = new CreateContactMessageUseCase(
      this.contactMessageRepository
    );

    this.getContactMessagesUseCase = new GetContactMessagesUseCase(
      this.contactMessageRepository
    );

    this.updateContactMessageStatusUseCase = new UpdateContactMessageStatusUseCase(
      this.contactMessageRepository
    );

    this.deleteContactMessageUseCase = new DeleteContactMessageUseCase(
      this.contactMessageRepository
    );

    this.contactController = new ContactController(
      this.createContactMessageUseCase,
      this.getContactMessagesUseCase,
      this.updateContactMessageStatusUseCase,
      this.deleteContactMessageUseCase
    );

    this.createCheckoutOrderUseCase = new CreateCheckoutOrderUseCase(
      this.checkoutOrderRepository
    );

    this.getCheckoutOrdersUseCase = new GetCheckoutOrdersUseCase(
      this.checkoutOrderRepository
    );

    this.updateCheckoutOrderStatusUseCase = new UpdateCheckoutOrderStatusUseCase(
      this.checkoutOrderRepository
    );

    this.deleteCheckoutOrderUseCase = new DeleteCheckoutOrderUseCase(
      this.checkoutOrderRepository
    );

    // Initialize Payment Use Cases
    this.createPaymentUseCase = new CreatePaymentUseCase(
      this.paymentRepository
    );

    this.initiatePaymentUseCase = new InitiatePaymentUseCase(
      this.paymentRepository,
      this.checkoutOrderRepository,
      this.yekpayService
    );

    this.verifyPaymentUseCase = new VerifyPaymentUseCase(
      this.paymentRepository,
      this.checkoutOrderRepository,
      this.userRepository,
      this.yekpayService
    );

    this.getPaymentsUseCase = new GetPaymentsUseCase(
      this.paymentRepository
    );

    this.checkoutController = new CheckoutController(
      this.createCheckoutOrderUseCase,
      this.getCheckoutOrdersUseCase,
      this.updateCheckoutOrderStatusUseCase,
      this.deleteCheckoutOrderUseCase,
      this.initiatePaymentUseCase,
      this.verifyPaymentUseCase
    );

    this.getErrorLogsUseCase = new GetErrorLogsUseCase(
      this.errorLogRepository
    );

    this.getErrorLogStatsUseCase = new GetErrorLogStatsUseCase(
      this.errorLogRepository
    );

    this.updateErrorLogUseCase = new UpdateErrorLogUseCase(
      this.errorLogRepository
    );

    this.deleteErrorLogUseCase = new DeleteErrorLogUseCase(
      this.errorLogRepository
    );

    this.deleteManyErrorLogsUseCase = new DeleteManyErrorLogsUseCase(
      this.errorLogRepository
    );

    this.generateThumbnailUseCase = new GenerateThumbnailUseCase(
      this.openAIService,
      this.googleAIService,
      this.userRepository,
      this.fileUploadService,
      this.generatedImageEntityRepository
    );

    this.errorLogController = new ErrorLogController(
      this.getErrorLogsUseCase,
      this.getErrorLogStatsUseCase,
      this.updateErrorLogUseCase,
      this.deleteErrorLogUseCase,
      this.deleteManyErrorLogsUseCase
    );

    this.thumbnailController = new ThumbnailController(
      this.generateThumbnailUseCase
    );

    this.upscaleController = new UpscaleController(
      this.aiUpscaleImageUseCase
    );

    this.generateProductImageUseCase = new GenerateProductImageUseCase(
      this.googleAIService,
      this.userRepository,
      this.fileUploadService,
      this.generatedImageEntityRepository,
      this.errorLogService
    );

    this.productImageController = new ProductImageController(
      this.generateProductImageUseCase
    );

    this.generateShopProductImageUseCase = new GenerateShopProductImageUseCase(
      this.googleAIService,
      this.shopRepository,
      this.fileUploadService,
      this.generatedImageEntityRepository,
      this.errorLogService,
      this.shopStyleRepository
    );

    this.shopProductImageController = new ShopProductImageController(
      this.generateShopProductImageUseCase,
      this.generatedImageEntityRepository,
      this.shopStyleRepository
    );

    // Initialize Zarinpal Payment Use Cases
    this.initiateZarinpalPaymentUseCase = new InitiateZarinpalPaymentUseCase(
      this.paymentRepository,
      this.checkoutOrderRepository,
      this.zarinpalService
    );

    this.verifyZarinpalPaymentUseCase = new VerifyZarinpalPaymentUseCase(
      this.paymentRepository,
      this.checkoutOrderRepository,
      this.userRepository,
      this.zarinpalService
    );

    // Initialize Shop Use Cases
    this.createShopUseCase = new CreateShopUseCase(
      this.shopRepository
    );

    this.getShopsUseCase = new GetShopsUseCase(
      this.shopRepository
    );

    this.deleteShopUseCase = new DeleteShopUseCase(
      this.shopRepository
    );

    this.activateLicenseUseCase = new ActivateLicenseUseCase(
      this.shopRepository
    );

    this.validateLicenseUseCase = new ValidateLicenseUseCase(
      this.shopRepository
    );

    this.regenerateShopLicenseUseCase = new RegenerateShopLicenseUseCase(
      this.shopRepository
    );

    this.shopController = new ShopController(
      this.createShopUseCase,
      this.getShopsUseCase,
      this.deleteShopUseCase,
      this.activateLicenseUseCase,
      this.validateLicenseUseCase,
      this.regenerateShopLicenseUseCase,
      this.fileUploadService
    );

    // Initialize Shop Category Use Cases
    this.createShopCategoryUseCase = new CreateShopCategoryUseCase(
      this.shopCategoryRepository
    );

    this.getShopCategoriesUseCase = new GetShopCategoriesUseCase(
      this.shopCategoryRepository
    );

    this.updateShopCategoryUseCase = new UpdateShopCategoryUseCase(
      this.shopCategoryRepository
    );

    this.deleteShopCategoryUseCase = new DeleteShopCategoryUseCase(
      this.shopCategoryRepository
    );

    this.shopCategoryController = new ShopCategoryController(
      this.createShopCategoryUseCase,
      this.getShopCategoriesUseCase,
      this.updateShopCategoryUseCase,
      this.deleteShopCategoryUseCase,
      this.fileUploadService,
      this.shopCategoryRepository
    );

    // Initialize Shop Style Use Cases
    this.createShopStyleUseCase = new CreateShopStyleUseCase(
      this.shopStyleRepository
    );

    this.getShopStylesUseCase = new GetShopStylesUseCase(
      this.shopStyleRepository
    );

    this.updateShopStyleUseCase = new UpdateShopStyleUseCase(
      this.shopStyleRepository
    );

    this.deleteShopStyleUseCase = new DeleteShopStyleUseCase(
      this.shopStyleRepository
    );

    this.shopStyleController = new ShopStyleController(
      this.createShopStyleUseCase,
      this.getShopStylesUseCase,
      this.updateShopStyleUseCase,
      this.deleteShopStyleUseCase,
      this.fileUploadService,
      this.shopStyleRepository
    );

    this.zarinpalController = new ZarinpalController(
      this.createCheckoutOrderUseCase,
      this.initiateZarinpalPaymentUseCase,
      this.verifyZarinpalPaymentUseCase
    );
  }
}
