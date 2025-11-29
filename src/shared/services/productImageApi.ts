import apiClient from './api';

export type ProductStyle =
    | 'ecommerce'
    | 'lifestyle'
    | 'flatlay'
    | 'minimal'
    | 'colorblock'
    | 'moody'
    | 'macro'
    | 'infographic'
    | 'ugc'
    | 'pinterest';

export interface GenerateProductImageResponse {
    image: string; // base64
    mimeType: string;
    prompt: string;
    imageUrl: string;
    imageId: string;
}

export const productImageApi = {
    generate: async (
        productName: string,
        style: ProductStyle,
        productImages: File[],
        productDescription?: string,
        referenceImage?: File,
        aspectRatio?: string,
        resolution?: string
    ): Promise<GenerateProductImageResponse> => {
        const formData = new FormData();
        formData.append('productName', productName);
        formData.append('style', style);

        // Add product images (up to 5)
        productImages.forEach(image => {
            formData.append('productImages', image);
        });

        if (productDescription) {
            formData.append('productDescription', productDescription);
        }

        if (aspectRatio) {
            formData.append('aspectRatio', aspectRatio);
        }

        if (resolution) {
            formData.append('resolution', resolution);
        }

        // Add reference image if provided (only 1)
        if (referenceImage) {
            formData.append('referenceImage', referenceImage);
        }

        const response = await apiClient.post<{
            status: string;
            data: GenerateProductImageResponse;
        }>('/tools/product-image/generate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 120000, // 2 minutes
        });

        return response.data.data;
    }
};
