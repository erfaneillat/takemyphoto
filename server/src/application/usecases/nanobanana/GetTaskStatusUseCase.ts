import { IGenerationTaskRepository } from '@core/domain/repositories/IGenerationTaskRepository';
import { GenerationTask } from '@core/domain/entities/GenerationTask';
import { NanoBananaService } from '@infrastructure/services/NanoBananaService';
import { IGeneratedImageEntityRepository } from '@core/domain/repositories/IGeneratedImageEntityRepository';
import { RemoteImageService } from '@infrastructure/services/RemoteImageService';

export interface GetTaskStatusRequest {
  taskId: string;
  userId: string;
}

export interface GetTaskStatusResponse {
  task: GenerationTask;
}

export class GetTaskStatusUseCase {
  constructor(
    private generationTaskRepository: IGenerationTaskRepository,
    private nanoBananaService: NanoBananaService,
    private generatedImageRepository: IGeneratedImageEntityRepository,
    private remoteImageService: RemoteImageService
  ) {}

  async execute(request: GetTaskStatusRequest): Promise<GetTaskStatusResponse> {
    const { taskId, userId } = request;

    let task = await this.generationTaskRepository.findByTaskId(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify ownership
    if (task.userId !== userId) {
      throw new Error('Unauthorized access to task');
    }

    // If task is still pending or processing, check NanoBanana API directly
    if (task.status === 'pending' || task.status === 'processing') {
      try {
        console.log('🔍 Polling NanoBanana API for task:', taskId);
        const apiStatus = await this.nanoBananaService.getTaskStatus(taskId);
        console.log('📊 NanoBanana API successFlag:', apiStatus.data.successFlag, 'for task:', taskId);
        
        // successFlag: 0-generating, 1-success, 2-create task failed, 3-generation failed
        const { successFlag, response, errorMessage } = apiStatus.data;
        
        // Update task status based on successFlag
        if (successFlag === 1) {
          // Success - task completed
          const imageUrls = [];
          if (response?.resultImageUrl) {
            imageUrls.push(response.resultImageUrl);
          }
          if (response?.originImageUrl) {
            imageUrls.push(response.originImageUrl);
          }

          // Save the main result image locally and use local URL everywhere
          let localUrl: string | null = null;
          if (response?.resultImageUrl) {
            const saved = await this.remoteImageService.downloadToUploads(response.resultImageUrl, 'nero/generated');
            localUrl = saved.url;
          }

          const updates: any = {
            status: 'completed',
            resultImageUrls: localUrl ? [localUrl] : imageUrls,
            completedAt: new Date(),
            updatedAt: new Date()
          };

          const updatedTask = await this.generationTaskRepository.updateByTaskId(taskId, updates);
          if (updatedTask) {
            task = updatedTask;
            console.log('✅ Task completed! Saved locally:', localUrl || imageUrls);
          }

          // Update generated image record with final LOCAL URL
          if (localUrl) {
            await this.generatedImageRepository.updateByTaskId(taskId, {
              imageUrl: localUrl,
              status: 'completed',
              completedAt: new Date()
            });
          }
        } else if (successFlag === 2 || successFlag === 3) {
          // Failed - task creation failed or generation failed
          const updates: any = {
            status: 'failed',
            error: errorMessage || 'Image generation failed',
            updatedAt: new Date()
          };

          const updatedTask = await this.generationTaskRepository.updateByTaskId(taskId, updates);
          if (updatedTask) {
            task = updatedTask;
            console.log('❌ Task failed:', errorMessage);
          }

          // Mark generated image record as failed
          await this.generatedImageRepository.updateByTaskId(taskId, {
            status: 'failed',
            error: errorMessage || 'Image generation failed'
          });
        } else if (successFlag === 0) {
          // Still generating
          if (task.status === 'pending') {
            const updatedTask = await this.generationTaskRepository.updateByTaskId(taskId, {
              status: 'processing',
              updatedAt: new Date()
            });
            if (updatedTask) {
              task = updatedTask;
              console.log('⏳ Task is processing...');
            }
          }
        }
      } catch (error) {
        console.error('Error checking NanoBanana task status:', error);
        // Continue with database task status if API check fails
      }
    }

    return { task };
  }
}
