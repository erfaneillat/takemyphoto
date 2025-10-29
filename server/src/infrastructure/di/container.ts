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

// Services
import { JwtService } from '@infrastructure/services/JwtService';
import { LocalFileUploadService } from '@infrastructure/services/LocalFileUploadService';
import { MockSmsService, ISmsService } from '@infrastructure/services/SmsService';
import { OpenAIService } from '@infrastructure/services/OpenAIService';
import { GoogleAIService } from '@infrastructure/services/GoogleAIService';
import { RemoteImageService } from '@infrastructure/services/RemoteImageService';

// Use Cases
import { SendVerificationCodeUseCase } from '@application/usecases/auth/SendVerificationCodeUseCase';
import { VerifyCodeUseCase } from '@application/usecases/auth/VerifyCodeUseCase';
import { GoogleAuthUseCase } from '@application/usecases/auth/GoogleAuthUseCase';
import { AdminLoginUseCase } from '@application/usecases/auth/AdminLoginUseCase';
import { CreateCharacterUseCase } from '@application/usecases/character/CreateCharacterUseCase';
import { GetUserCharactersUseCase } from '@application/usecases/character/GetUserCharactersUseCase';
import { DeleteCharacterUseCase } from '@application/usecases/character/DeleteCharacterUseCase';
import { GetTemplatesUseCase } from '@application/usecases/template/GetTemplatesUseCase';
import { GetTemplatesWithFavoritesUseCase } from '@application/usecases/template/GetTemplatesWithFavoritesUseCase';
import { ToggleFavoriteTemplateUseCase } from '@application/usecases/template/ToggleFavoriteTemplateUseCase';
import { GetUserFavoritesUseCase } from '@application/usecases/template/GetUserFavoritesUseCase';
import { CreateTemplateUseCase } from '@application/usecases/template/CreateTemplateUseCase';
import { UpdateTemplateUseCase } from '@application/usecases/template/UpdateTemplateUseCase';
import { DeleteTemplateUseCase } from '@application/usecases/template/DeleteTemplateUseCase';
import { CreateCategoryUseCase } from '@application/usecases/category/CreateCategoryUseCase';
import { GetCategoriesUseCase } from '@application/usecases/category/GetCategoriesUseCase';
import { UpdateCategoryUseCase } from '@application/usecases/category/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '@application/usecases/category/DeleteCategoryUseCase';
import { GetUserProfileUseCase } from '@application/usecases/user/GetUserProfileUseCase';
import { UpscaleImageUseCase } from '@application/usecases/enhance/UpscaleImageUseCase';
import { ImageToPromptUseCase } from '@application/usecases/enhance/ImageToPromptUseCase';
import { GenerateImageUseCase } from '@application/usecases/nanobanana/GenerateImageUseCase';
import { EditImageUseCase } from '@application/usecases/nanobanana/EditImageUseCase';
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

  // Services
  public jwtService: JwtService;
  public fileUploadService: LocalFileUploadService;
  public smsService: ISmsService;
  public openAIService: OpenAIService;
  public googleAIService: GoogleAIService;
  public remoteImageService: RemoteImageService;

  // Use Cases
  public sendVerificationCodeUseCase: SendVerificationCodeUseCase;
  public verifyCodeUseCase: VerifyCodeUseCase;
  public googleAuthUseCase: GoogleAuthUseCase;
  public adminLoginUseCase: AdminLoginUseCase;
  public createCharacterUseCase: CreateCharacterUseCase;
  public getUserCharactersUseCase: GetUserCharactersUseCase;
  public deleteCharacterUseCase: DeleteCharacterUseCase;
  public getTemplatesUseCase: GetTemplatesUseCase;
  public getTemplatesWithFavoritesUseCase: GetTemplatesWithFavoritesUseCase;
  public toggleFavoriteTemplateUseCase: ToggleFavoriteTemplateUseCase;
  public getUserFavoritesUseCase: GetUserFavoritesUseCase;
  public createTemplateUseCase: CreateTemplateUseCase;
  public updateTemplateUseCase: UpdateTemplateUseCase;
  public deleteTemplateUseCase: DeleteTemplateUseCase;
  public createCategoryUseCase: CreateCategoryUseCase;
  public getCategoriesUseCase: GetCategoriesUseCase;
  public updateCategoryUseCase: UpdateCategoryUseCase;
  public deleteCategoryUseCase: DeleteCategoryUseCase;
  public getUserProfileUseCase: GetUserProfileUseCase;
  public upscaleImageUseCase: UpscaleImageUseCase;
  public imageToPromptUseCase: ImageToPromptUseCase;
  public generateImageUseCase: GenerateImageUseCase;
  public editImageUseCase: EditImageUseCase;
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

    // Initialize Services
    this.jwtService = new JwtService();
    this.fileUploadService = new LocalFileUploadService();
    this.openAIService = new OpenAIService();
    this.googleAIService = new GoogleAIService();
    this.remoteImageService = new RemoteImageService();
    this.smsService = new MockSmsService();

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

    this.createTemplateUseCase = new CreateTemplateUseCase(
      this.templateRepository
    );

    this.updateTemplateUseCase = new UpdateTemplateUseCase(
      this.templateRepository
    );

    this.deleteTemplateUseCase = new DeleteTemplateUseCase(
      this.templateRepository
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
      this.generatedImageEntityRepository
    );

    this.editImageUseCase = new EditImageUseCase(
      this.googleAIService,
      this.fileUploadService,
      this.generatedImageEntityRepository
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
      this.deleteCharacterUseCase
    );

    this.templateController = new TemplateController(
      this.getTemplatesWithFavoritesUseCase,
      this.toggleFavoriteTemplateUseCase,
      this.getUserFavoritesUseCase
    );

    this.userController = new UserController(
      this.getUserProfileUseCase,
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
  }
}
