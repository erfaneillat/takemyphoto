import apiClient from './api';

export interface GenerateThumbnailResponse {
    image: string;
    mimeType: string;
    prompt: string;
}

export const thumbnailApi = {
    generate: async (description: string, language: string, images: File[], aspectRatio?: string, visualDescription?: string, resolution?: string): Promise<GenerateThumbnailResponse> => {
        const formData = new FormData();
        formData.append('description', description);
        formData.append('language', language);
        if (visualDescription) {
            formData.append('visualDescription', visualDescription);
        }
        if (aspectRatio) {
            formData.append('aspectRatio', aspectRatio);
        }
        if (resolution) {
            formData.append('resolution', resolution);
        }
        images.forEach(image => {
            formData.append('images', image);
        });

        const response = await apiClient.post<{
            status: string;
            data: GenerateThumbnailResponse;
        }>('/tools/thumbnail/generate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 120000, // 2 minutes for double AI call
        });

        return response.data.data;
    }
};

