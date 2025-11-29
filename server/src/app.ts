import express, { Application } from 'express';
import path from 'path';
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
import { createDashboardRoutes } from '@presentation/routes/dashboardRoutes';
import { createContactRoutes } from '@presentation/routes/contactRoutes';
import { createCheckoutRoutes } from '@presentation/routes/checkoutRoutes';
import { createErrorLogRoutes } from '@presentation/routes/errorLogRoutes';
import { createThumbnailRoutes } from '@presentation/routes/thumbnailRoutes';
import { createUpscaleRoutes } from '@presentation/routes/upscaleRoutes';
import { createProductImageRoutes } from '@presentation/routes/productImageRoutes';
import { errorHandler, setErrorLogService } from '@presentation/middleware/errorHandler';

export class App {
  public app: Application;
  private container: Container;

  constructor() {
    this.app = express();
    this.container = new Container();

    // Initialize error logging service
    setErrorLogService(this.container.errorLogService);

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
    const corsEnv = process.env.CORS_ORIGIN || 'http://localhost:2000,http://localhost:5175,http://localhost:5173,http://localhost:5174';
    const allowedOrigins = corsEnv
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);

    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow REST tools or same-origin server-to-server (no origin header)
        if (!origin) return callback(null, true);
        // Some environments send the literal string 'null' as origin (e.g., sandboxed iframes, file://)
        if (origin === 'null') return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS origin not allowed: ${origin}`));
      },
      credentials: true
    }));

    // Body parsing
    this.app.use(express.json({ limit: '100mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '100mb' }));

    // Compression
    this.app.use(compression({
      filter: (req, res) => {
        // Disable compression for Server-Sent Events or specific streaming routes
        const url = (req.originalUrl || req.url || '').toLowerCase();
        if (url.includes('/admin/templates/import')) return false;
        const contentType = res.getHeader('Content-Type');
        if (typeof contentType === 'string' && contentType.includes('text/event-stream')) return false;
        // Fallback to default filter
        return compression.filter(req, res);
      }
    }));

    // Rate limiting
    const isDev = (process.env.NODE_ENV || 'development') !== 'production';
    const windowMs = parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || (isDev ? '60000' : '900000')
    );
    const maxRequests = parseInt(
      process.env.RATE_LIMIT_MAX_REQUESTS || (isDev ? '1000' : '100')
    );
    const limiter = rateLimit({
      windowMs, // e.g., 1 minute in dev, 15 minutes in prod
      max: maxRequests, // e.g., 1000 in dev, 100 in prod
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many requests from this IP, please try again later',
    });
    this.app.use('/api', limiter);

    // Static files for uploads (set permissive headers for dev)
    const uploadsPrimary = path.resolve(__dirname, '../../uploads');
    const uploadsFallback = path.resolve(process.cwd(), 'uploads');
    const uploadsProjectRoot = path.resolve(__dirname, '../../../../uploads');
    const setStaticHeaders = (_req: any, res: any, next: any) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    };
    // Primary location
    this.app.use('/uploads', setStaticHeaders, express.static(uploadsPrimary, {
      setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
      },
    }));
    // Fallback location for legacy files
    this.app.use('/uploads', setStaticHeaders, express.static(uploadsFallback, {
      setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
      },
    }));
    // Project root uploads (align with LocalFileUploadService)
    this.app.use('/uploads', setStaticHeaders, express.static(uploadsProjectRoot, {
      setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
      },
    }));

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
    this.app.use(`${baseUrl}/tools/thumbnail`, createThumbnailRoutes(this.container.thumbnailController));
    this.app.use(`${baseUrl}/dashboard`, createDashboardRoutes(this.container.dashboardController));
    this.app.use(`${baseUrl}/contact`, createContactRoutes(this.container.contactController));
    this.app.use(`${baseUrl}/checkout`, createCheckoutRoutes(this.container.checkoutController));
    this.app.use(`${baseUrl}/error-logs`, createErrorLogRoutes(this.container.errorLogController));
    // Upscale tool routes
    this.app.use(`${baseUrl}/upscale`, createUpscaleRoutes(this.container.upscaleController));
    // Product image generator routes
    this.app.use(`${baseUrl}/tools/product-image`, createProductImageRoutes(this.container.productImageController));

    // Serve panel static files at /panel
    const panelPath = path.join(__dirname, '../../panel/dist');
    this.app.use('/panel', express.static(panelPath));

    // Serve index.html for /panel root
    this.app.get('/panel', (_req, res) => {
      res.sendFile(path.join(panelPath, 'index.html'));
    });

    // Handle panel SPA routing - serve index.html for any /panel/* routes
    this.app.get('/panel/*', (_req, res) => {
      res.sendFile(path.join(panelPath, 'index.html'));
    });

    // Serve main web frontend static files
    const webPath = path.join(__dirname, '../../dist');
    this.app.use(express.static(webPath));

    // Handle web app SPA routing - serve index.html for any non-API routes
    this.app.get('*', (req, res) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith('/api')) {
        res.status(404).json({
          status: 'error',
          message: `Route ${req.originalUrl} not found`
        });
      } else {
        res.sendFile(path.join(webPath, 'index.html'));
      }
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public getExpressApp(): Application {
    return this.app;
  }
}
