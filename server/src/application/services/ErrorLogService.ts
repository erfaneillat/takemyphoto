import { Request } from 'express';
import { CreateErrorLogUseCase } from '../usecases/error-log/CreateErrorLogUseCase';
import { ErrorType, ErrorSeverity } from '@core/domain/entities/ErrorLog';

export class ErrorLogService {
  constructor(private createErrorLogUseCase: CreateErrorLogUseCase) {}

  /**
   * Log an error with automatic context extraction from Express request
   */
  async logError(error: Error, req?: Request, options?: {
    type?: ErrorType;
    severity?: ErrorSeverity;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const errorType = options?.type || this.determineErrorType(error);
      const severity = options?.severity || this.determineSeverity(error);

      await this.createErrorLogUseCase.execute({
        type: errorType,
        severity,
        message: error.message,
        stack: error.stack,
        endpoint: req?.originalUrl || req?.url,
        method: req?.method,
        userId: (req as any)?.user?.id,
        statusCode: (error as any).statusCode || (error as any).status,
        requestBody: this.sanitizeData(req?.body),
        requestParams: req?.params,
        requestQuery: req?.query,
        userAgent: req?.get('user-agent'),
        ipAddress: req?.ip || req?.socket?.remoteAddress,
        metadata: options?.metadata
      });
    } catch (logError) {
      // Fail silently - don't break the application if logging fails
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Log a custom error without Express request
   */
  async logCustomError(
    message: string,
    options: {
      type: ErrorType;
      severity: ErrorSeverity;
      stack?: string;
      userId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      await this.createErrorLogUseCase.execute({
        type: options.type,
        severity: options.severity,
        message,
        stack: options.stack,
        userId: options.userId,
        metadata: options.metadata
      });
    } catch (logError) {
      console.error('Failed to log custom error:', logError);
    }
  }

  /**
   * Log a generation error with additional metadata
   */
  async logGenerationError(
    error: Error,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.createErrorLogUseCase.execute({
        type: ErrorType.GENERATION,
        severity: ErrorSeverity.HIGH,
        message: error.message,
        stack: error.stack,
        userId,
        metadata: {
          templateId: metadata?.templateId,
          characterId: metadata?.characterId,
          prompt: metadata?.prompt,
          provider: metadata?.provider,
          operation: metadata?.operation,
          referenceImagesCount: metadata?.referenceImagesCount,
          ...metadata
        }
      });
    } catch (logError) {
      console.error('Failed to log generation error:', logError);
    }
  }

  /**
   * Determine error type based on error properties
   */
  private determineErrorType(error: Error): ErrorType {
    const errorName = error.name.toLowerCase();
    const errorMessage = error.message.toLowerCase();

    if (errorName.includes('validation') || errorMessage.includes('validation')) {
      return ErrorType.VALIDATION;
    }
    if (errorName.includes('auth') || errorMessage.includes('unauthorized')) {
      return ErrorType.AUTHENTICATION;
    }
    if (errorMessage.includes('forbidden') || errorMessage.includes('permission')) {
      return ErrorType.AUTHORIZATION;
    }
    if (errorName.includes('mongo') || errorName.includes('database')) {
      return ErrorType.DATABASE;
    }
    if (errorMessage.includes('generation') || errorMessage.includes('image')) {
      return ErrorType.GENERATION;
    }
    if (errorMessage.includes('api') || errorMessage.includes('request')) {
      return ErrorType.EXTERNAL_SERVICE;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Determine severity based on error properties
   */
  private determineSeverity(error: Error): ErrorSeverity {
    const statusCode = (error as any).statusCode || (error as any).status;
    const errorMessage = error.message.toLowerCase();

    // Critical errors
    if (statusCode >= 500 || errorMessage.includes('critical') || errorMessage.includes('crash')) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity
    if (statusCode >= 400 || errorMessage.includes('failed') || errorMessage.includes('error')) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity
    if (errorMessage.includes('warning') || errorMessage.includes('deprecated')) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  /**
   * Sanitize sensitive data from request body
   */
  private sanitizeData(data: any): any {
    if (!data) return undefined;

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
