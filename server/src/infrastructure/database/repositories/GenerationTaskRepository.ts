import { IGenerationTaskRepository } from '@core/domain/repositories/IGenerationTaskRepository';
import { GenerationTask, CreateGenerationTaskDTO } from '@core/domain/entities/GenerationTask';
import { GenerationTaskModel, GenerationTaskDocument } from '../models/GenerationTaskModel';

export class GenerationTaskRepository implements IGenerationTaskRepository {
  private toEntity(doc: GenerationTaskDocument): GenerationTask {
    return {
      id: (doc._id as any).toString(),
      taskId: doc.taskId,
      userId: doc.userId,
      prompt: doc.prompt,
      type: doc.type,
      status: doc.status,
      imageUrls: doc.imageUrls,
      referenceImageUrls: doc.referenceImageUrls,
      numImages: doc.numImages,
      imageSize: doc.imageSize,
      resultImageUrls: doc.resultImageUrls,
      error: doc.error,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      completedAt: doc.completedAt
    };
  }

  async create(taskData: CreateGenerationTaskDTO): Promise<GenerationTask> {
    const task = new GenerationTaskModel(taskData);
    const savedTask = await task.save();
    return this.toEntity(savedTask);
  }

  async findById(id: string): Promise<GenerationTask | null> {
    const task = await GenerationTaskModel.findById(id);
    return task ? this.toEntity(task) : null;
  }

  async findByTaskId(taskId: string): Promise<GenerationTask | null> {
    const task = await GenerationTaskModel.findOne({ taskId });
    return task ? this.toEntity(task) : null;
  }

  async findByUserId(userId: string, limit: number = 50): Promise<GenerationTask[]> {
    const tasks = await GenerationTaskModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    return tasks.map(task => this.toEntity(task));
  }

  async update(id: string, updates: Partial<GenerationTask>): Promise<GenerationTask | null> {
    const task = await GenerationTaskModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    return task ? this.toEntity(task) : null;
  }

  async updateByTaskId(taskId: string, updates: Partial<GenerationTask>): Promise<GenerationTask | null> {
    const task = await GenerationTaskModel.findOneAndUpdate(
      { taskId },
      { $set: updates },
      { new: true }
    );
    return task ? this.toEntity(task) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await GenerationTaskModel.findByIdAndDelete(id);
    return !!result;
  }
}
