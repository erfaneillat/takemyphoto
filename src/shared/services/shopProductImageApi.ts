import apiClient from './api';

export type ShopProductStyle =
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

export interface ShopGenerateProductImageResponse {
    image: string; // base64
    mimeType: string;
    prompt: string;
    imageUrl: string;
    imageId: string;
}

export interface ShopGeneratedImage {
    id: string;
    prompt: string;
    imageUrl: string;
    status: string;
    createdAt: string;
}

/**
 * Shop product image API — uses license key for auth.
 * No stars needed — shops pay via license.
 */
export const shopProductImageApi = {
    listImages: async (
        licenseKey: string,
        limit: number = 50,
        skip: number = 0
    ): Promise<ShopGeneratedImage[]> => {
        const response = await apiClient.get<{
            status: string;
            data: { images: ShopGeneratedImage[] };
        }>('/shops/product-image/images', {
            headers: {
                'x-license-key': licenseKey,
            },
            params: { limit, skip },
        });
        return response.data.data.images;
    },

    generate: async (
        productName: string,
        style: ShopProductStyle,
        productImages: File[],
        licenseKey: string,
        deviceFingerprint: string,
        productDescription?: string,
        referenceImage?: File,
        aspectRatio?: string,
    ): Promise<ShopGenerateProductImageResponse> => {
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

        // Add reference image if provided (only 1)
        if (referenceImage) {
            formData.append('referenceImage', referenceImage);
        }

        const response = await apiClient.post<{
            status: string;
            data: ShopGenerateProductImageResponse;
        }>('/shops/product-image/generate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'x-license-key': licenseKey,
                'x-device-fingerprint': deviceFingerprint,
            },
            timeout: 120000, // 2 minutes
        });

        return response.data.data;
    }
};
