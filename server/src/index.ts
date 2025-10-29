import dotenv from 'dotenv';
import { App } from './app';
import { DatabaseConnection } from '@infrastructure/database/connection';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 2000;

async function bootstrap() {
  try {
    // Connect to database
    const db = DatabaseConnection.getInstance();
    await db.connect();

    // Create and start the app
    const app = new App();
    const server = app.getExpressApp();

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api/v1`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`📊 Panel: http://localhost:${PORT}/panel`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      await db.disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully...');
      await db.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
