import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import { Container } from '@infrastructure/di/container';
import { createAuthRoutes } from '@presentation/routes/authRoutes';
import { createCharacterRoutes } from '@presentation/routes/characterRoutes';
import { createTemplateRoutes } from '@presentation/routes/templateRoutes';
import { createUserRoutes } from '@presentation/routes/userRoutes';
import { createCategoryRoutes } from '@presentation/routes/categoryRoutes';
import { createAdminTemplateRoutes } from '@presentation/routes/adminTemplateRoutes';
import { createEnhanceRoutes } from '@presentation/routes/enhanceRoutes';
import { createImageGenerationRoutes } from '@presentation/routes/nanobananaRoutes';
import { errorHandler } from '@presentation/middleware/errorHandler';

export class App {
  public app: Application;
  private container: Container;

  constructor() {
    this.app = express();
    this.container = new Container();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware (allow cross-origin resource loading for images)
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Disable COEP in dev to prevent cross-origin image blocking
      crossOriginEmbedderPolicy: false,
    }));
    this.app.use(mongoSanitize());
    this.app.use(hpp());

    // CORS
    const corsEnv = process.env.CORS_ORIGIN || 'http://localhost:5175,http://localhost:5173,http://localhost:5174';
    const allowedOrigins = corsEnv
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);

    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow REST tools or same-origin server-to-server (no origin header)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS origin not allowed: ${origin}`));
      },
      credentials: true
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: 'Too many requests from this IP, please try again later'
    });
    this.app.use('/api', limiter);

    // Static files for uploads (set permissive headers for dev)
    this.app.use(
      '/uploads',
      (_req, res, next) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        // Allow any origin to fetch images (sufficient for <img> loads)
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
      },
      express.static('uploads', {
        setHeaders: (res) => {
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
          res.setHeader('Access-Control-Allow-Origin', '*');
        },
      })
    );

    // Health check
    this.app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  private setupRoutes(): void {
    const apiVersion = process.env.API_VERSION || 'v1';
    const baseUrl = `/api/${apiVersion}`;

    // Routes
    this.app.use(`${baseUrl}/auth`, createAuthRoutes(this.container.authController));
    this.app.use(`${baseUrl}/characters`, createCharacterRoutes(this.container.characterController));
    this.app.use(`${baseUrl}/templates`, createTemplateRoutes(this.container.templateController));
    this.app.use(`${baseUrl}/users`, createUserRoutes(this.container.userController));
    this.app.use(`${baseUrl}/categories`, createCategoryRoutes(this.container.categoryController));
    this.app.use(`${baseUrl}/admin/templates`, createAdminTemplateRoutes(this.container.adminTemplateController));
    this.app.use(`${baseUrl}/enhance`, createEnhanceRoutes(this.container.enhanceController));
    // Image generation routes (Google AI) - kept as /nanobanana for backwards compatibility
    this.app.use(`${baseUrl}/nanobanana`, createImageGenerationRoutes(this.container.imageGenerationController));

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public getExpressApp(): Application {
    return this.app;
  }
}
