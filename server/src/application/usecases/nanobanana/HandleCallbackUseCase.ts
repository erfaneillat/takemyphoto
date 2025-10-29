import { IGenerationTaskRepository } from '@core/domain/repositories/IGenerationTaskRepository';
import { IGeneratedImageEntityRepository } from '@core/domain/repositories/IGeneratedImageEntityRepository';
import { NanoBananaCallbackData } from '@infrastructure/services/NanoBananaService';
import { RemoteImageService } from '@infrastructure/services/RemoteImageService';

export interface HandleCallbackRequest {
  callbackData: NanoBananaCallbackData;
}

export interface HandleCallbackResponse {
  success: boolean;
  message: string;
}

export class HandleCallbackUseCase {
  constructor(
    private generationTaskRepository: IGenerationTaskRepository,
    private generatedImageRepository: IGeneratedImageEntityRepository,
    private remoteImageService: RemoteImageService
  ) {}

  async execute(request: HandleCallbackRequest): Promise<HandleCallbackResponse> {
    const { callbackData } = request;
    const { code, msg, data } = callbackData;
    const { taskId, info } = data;

    console.log('🔔 Processing callback for task:', taskId, 'code:', code, 'msg:', msg);

    const task = await this.generationTaskRepository.findByTaskId(taskId);

    if (!task) {
      console.error('❌ Task not found in database:', taskId);
      throw new Error('Task not found');
    }

    // Update task based on callback code
    // 200 = success, 400 = content policy violation, 500 = internal error, 501 = generation failed
    const updates: any = {
      updatedAt: new Date()
    };

    if (code === 200) {
      // Success - image generation completed
      updates.status = 'completed';
      updates.completedAt = new Date();
      
      if (info?.resultImageUrl) {
        // Download to local storage and get public URL
        const saved = await this.remoteImageService.downloadToUploads(info.resultImageUrl, 'nero/generated');
        updates.resultImageUrls = [saved.url];
        console.log('✅ Callback success! Saved locally at:', saved.url);

        // Update generated image record with final LOCAL image URL
        await this.generatedImageRepository.updateByTaskId(taskId, {
          imageUrl: saved.url,
          status: 'completed',
          completedAt: new Date()
        });
      }
    } else {
      // Failed - various error codes
      updates.status = 'failed';
      
      let errorMessage = msg;
      if (code === 400) {
        errorMessage = 'Content policy violation: ' + msg;
      } else if (code === 500) {
        errorMessage = 'Internal error: ' + msg;
      } else if (code === 501) {
        errorMessage = 'Generation failed: ' + msg;
      }
      
      updates.error = errorMessage;
      console.log('❌ Callback failed:', errorMessage);

      // Update generated image record with error
      await this.generatedImageRepository.updateByTaskId(taskId, {
        status: 'failed',
        error: errorMessage
      });
    }

    await this.generationTaskRepository.updateByTaskId(taskId, updates);

    return {
      success: true,
      message: `Task ${taskId} updated successfully`
    };
  }
}
