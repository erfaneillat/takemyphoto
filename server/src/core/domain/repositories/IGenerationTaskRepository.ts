import { GenerationTask, CreateGenerationTaskDTO } from '../entities/GenerationTask';

export interface IGenerationTaskRepository {
  create(taskData: CreateGenerationTaskDTO): Promise<GenerationTask>;
  findById(id: string): Promise<GenerationTask | null>;
  findByTaskId(taskId: string): Promise<GenerationTask | null>;
  findByUserId(userId: string, limit?: number): Promise<GenerationTask[]>;
  update(id: string, updates: Partial<GenerationTask>): Promise<GenerationTask | null>;
  updateByTaskId(taskId: string, updates: Partial<GenerationTask>): Promise<GenerationTask | null>;
  delete(id: string): Promise<boolean>;
}
