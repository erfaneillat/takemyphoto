import { IErrorLogRepository } from '@core/domain/repositories/IErrorLogRepository';
import { ErrorLog, CreateErrorLogDTO, UpdateErrorLogDTO } from '@core/domain/entities/ErrorLog';
import { ErrorLogModel } from '../models/ErrorLogModel';

export class ErrorLogRepository implements IErrorLogRepository {
  async create(data: CreateErrorLogDTO): Promise<ErrorLog> {
    const log = await ErrorLogModel.create(data);
    return log.toJSON() as ErrorLog;
  }

  async findById(id: string): Promise<ErrorLog | null> {
    const log = await ErrorLogModel.findById(id);
    return log ? (log.toJSON() as ErrorLog) : null;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    filters?: {
      type?: string;
      severity?: string;
      resolved?: boolean;
      userId?: string;
    }
  ): Promise<{ logs: ErrorLog[]; total: number }> {
    const skip = (page - 1) * limit;
    
    // Build filter query
    const query: any = {};
    if (filters?.type) query.type = filters.type;
    if (filters?.severity) query.severity = filters.severity;
    if (filters?.resolved !== undefined) query.resolved = filters.resolved;
    if (filters?.userId) query.userId = filters.userId;

    const [logs, total] = await Promise.all([
      ErrorLogModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ErrorLogModel.countDocuments(query)
    ]);

    return {
      logs: logs.map(log => ({
        ...log,
        id: log._id.toString(),
        _id: undefined,
        __v: undefined
      })) as ErrorLog[],
      total
    };
  }

  async update(id: string, data: UpdateErrorLogDTO): Promise<ErrorLog | null> {
    const updateData: any = { ...data };
    if (data.resolved) {
      updateData.resolvedAt = new Date();
    }
    
    const log = await ErrorLogModel.findByIdAndUpdate(id, updateData, { new: true });
    return log ? (log.toJSON() as ErrorLog) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ErrorLogModel.findByIdAndDelete(id);
    return !!result;
  }

  async deleteMany(ids: string[]): Promise<number> {
    const result = await ErrorLogModel.deleteMany({ _id: { $in: ids } });
    return result.deletedCount || 0;
  }

  async getStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    unresolved: number;
  }> {
    const [total, byType, bySeverity, unresolved] = await Promise.all([
      ErrorLogModel.countDocuments(),
      ErrorLogModel.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      ErrorLogModel.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      ErrorLogModel.countDocuments({ resolved: false })
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      bySeverity: bySeverity.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      unresolved
    };
  }
}
