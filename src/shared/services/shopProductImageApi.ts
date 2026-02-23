import apiClient from './api';

export type ShopProductStyle = string;

export interface ShopStyleItem {
    id: string;
    name: string;
    slug: string;
    description?: string;
    prompt: string;
    thumbnailUrl?: string;
    types: string[];
    order: number;
    isActive: boolean;
}

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
    getStyles: async (types?: string[]): Promise<ShopStyleItem[]> => {
        const params: any = { isActive: 'true' };
        if (types && types.length > 0) {
            params.types = types.join(',');
        }
        const response = await apiClient.get<{
            status: string;
            data: { styles: ShopStyleItem[] };
        }>('/shop-styles', { params });
        return response.data.data.styles;
    },

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
        modelType?: 'normal' | 'pro',
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

        if (modelType) {
            formData.append('modelType', modelType);
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

