import { ErrorLog, CreateErrorLogDTO, UpdateErrorLogDTO } from '../entities/ErrorLog';

export interface IErrorLogRepository {
  create(data: CreateErrorLogDTO): Promise<ErrorLog>;
  findById(id: string): Promise<ErrorLog | null>;
  findAll(
    page: number,
    limit: number,
    filters?: {
      type?: string;
      severity?: string;
      resolved?: boolean;
      userId?: string;
    }
  ): Promise<{ logs: ErrorLog[]; total: number }>;
  update(id: string, data: UpdateErrorLogDTO): Promise<ErrorLog | null>;
  delete(id: string): Promise<boolean>;
  deleteMany(ids: string[]): Promise<number>;
  getStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    unresolved: number;
  }>;
}
