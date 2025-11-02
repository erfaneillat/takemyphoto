import { Request, Response, NextFunction } from 'express';
import { ErrorLogService } from '@application/services/ErrorLogService';
import { ErrorType, ErrorSeverity } from '@core/domain/entities/ErrorLog';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

let errorLogService: ErrorLogService | null = null;

export const setErrorLogService = (service: ErrorLogService) => {
  errorLogService = service;
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error to database
  if (errorLogService) {
    const errorType = determineErrorType(err);
    const severity = determineSeverity(err);
    
    errorLogService.logError(err, req, { type: errorType, severity }).catch(logErr => {
      console.error('Failed to log error to database:', logErr);
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

const determineErrorType = (error: Error): ErrorType => {
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

  return ErrorType.API;
};

const determineSeverity = (error: Error): ErrorSeverity => {
  const statusCode = (error as any).statusCode || (error as any).status;

  if (statusCode >= 500) {
    return ErrorSeverity.CRITICAL;
  }
  if (statusCode >= 400) {
    return ErrorSeverity.HIGH;
  }

  return ErrorSeverity.MEDIUM;
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
