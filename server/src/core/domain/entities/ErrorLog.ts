export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorType {
  API = 'api',
  DATABASE = 'database',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  GENERATION = 'generation',
  EXTERNAL_SERVICE = 'external_service',
  SYSTEM = 'system',
  UNKNOWN = 'unknown'
}

export interface ErrorLog {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  userId?: string;
  statusCode?: number;
  requestBody?: any;
  requestParams?: any;
  requestQuery?: any;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateErrorLogDTO {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  userId?: string;
  statusCode?: number;
  requestBody?: any;
  requestParams?: any;
  requestQuery?: any;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface UpdateErrorLogDTO {
  resolved?: boolean;
  resolvedBy?: string;
  notes?: string;
}
