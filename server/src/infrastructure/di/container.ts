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
import { ErrorLogRepository } from '@infrastructure/database/repositories/ErrorLogRepository';

// Services
import { JwtService } from '@infrastructure/services/JwtService';
import { LocalFileUploadService } from '@infrastructure/services/LocalFileUploadService';
import { MockSmsService, ISmsService } from '@infrastructure/services/SmsService';
import { OpenAIService } from '@infrastructure/services/OpenAIService';
import { GoogleAIService } from '@infrastructure/services/GoogleAIService';
import { RemoteImageService } from '@infrastructure/services/RemoteImageService';
import { ErrorLogService } from '@application/services/ErrorLogService';

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
import { CreateErrorLogUseCase } from '@application/usecases/error-log/CreateErrorLogUseCase';
import { GetErrorLogsUseCase } from '@application/usecases/error-log/GetErrorLogsUseCase';
import { GetErrorLogStatsUseCase } from '@application/usecases/error-log/GetErrorLogStatsUseCase';
import { UpdateErrorLogUseCase } from '@application/usecases/error-log/UpdateErrorLogUseCase';
import { DeleteErrorLogUseCase } from '@application/usecases/error-log/DeleteErrorLogUseCase';
import { DeleteManyErrorLogsUseCase } from '@application/usecases/error-log/DeleteManyErrorLogsUseCase';
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
import { DashboardController } from '@presentation/controllers/DashboardController';
import { ContactController } from '@presentation/controllers/ContactController';
import { CheckoutController } from '@presentation/controllers/CheckoutController';
import { ErrorLogController } from '@presentation/controllers/ErrorLogController';

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
  public errorLogRepository: ErrorLogRepository;

  // Services
  public jwtService: JwtService;
  public fileUploadService: LocalFileUploadService;
  public smsService: ISmsService;
  public openAIService: OpenAIService;
  public googleAIService: GoogleAIService;
  public remoteImageService: RemoteImageService;
  public errorLogService: ErrorLogService;

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
  public createErrorLogUseCase: CreateErrorLogUseCase;
  public getErrorLogsUseCase: GetErrorLogsUseCase;
  public getErrorLogStatsUseCase: GetErrorLogStatsUseCase;
  public updateErrorLogUseCase: UpdateErrorLogUseCase;
  public deleteErrorLogUseCase: DeleteErrorLogUseCase;
  public deleteManyErrorLogsUseCase: DeleteManyErrorLogsUseCase;
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
  public dashboardController: DashboardController;
  public contactController: ContactController;
  public checkoutController: CheckoutController;
  public errorLogController: ErrorLogController;

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
    this.errorLogRepository = new ErrorLogRepository();

    // Initialize Services
    this.jwtService = new JwtService();
    this.fileUploadService = new LocalFileUploadService();
    this.openAIService = new OpenAIService();
    this.googleAIService = new GoogleAIService();
    this.remoteImageService = new RemoteImageService();
    this.smsService = new MockSmsService();

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

    this.upscaleImageUseCase = new UpscaleImageUseCase();

    this.imageToPromptUseCase = new ImageToPromptUseCase(
      this.openAIService
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

    this.checkoutController = new CheckoutController(
      this.createCheckoutOrderUseCase,
      this.getCheckoutOrdersUseCase,
      this.updateCheckoutOrderStatusUseCase,
      this.deleteCheckoutOrderUseCase
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

    this.errorLogController = new ErrorLogController(
      this.getErrorLogsUseCase,
      this.getErrorLogStatsUseCase,
      this.updateErrorLogUseCase,
      this.deleteErrorLogUseCase,
      this.deleteManyErrorLogsUseCase
    );
  }
}
