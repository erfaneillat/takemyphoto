import { useState } from 'react';

interface UpscaleState {
    selectedImage: File | null;
    selectedResolution: string;
    isUpscaling: boolean;
    upscaledImage: string | null;
    error: string | null;
}

export const useUpscaleState = () => {
    const [state, setState] = useState<UpscaleState>({
        selectedImage: null,
        selectedResolution: '2K', // Default to 2K
        isUpscaling: false,
        upscaledImage: null,
        error: null
    });

    const setSelectedImage = (image: File | null) => {
        setState(prev => ({ ...prev, selectedImage: image }));
    };

    const setSelectedResolution = (resolution: string) => {
        setState(prev => ({ ...prev, selectedResolution: resolution }));
    };

    const clearResults = () => {
        setState(prev => ({ ...prev, upscaledImage: null, error: null }));
    };

    const upscaleImage = async () => {
        if (!state.selectedImage || !state.selectedResolution) {
            return;
        }

        setState(prev => ({ ...prev, isUpscaling: true, error: null }));

        try {
            const formData = new FormData();
            formData.append('image', state.selectedImage);
            formData.append('resolution', state.selectedResolution);

            const apiBase = (() => {
                const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
                if (!raw) return '/api/v1';
                if (raw.startsWith('http')) return raw;
                return raw.startsWith('/') ? raw : `/${raw}`;
            })();

            const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || '';

            if (!token) {
                throw new Error('Authentication required. Please log in.');
            }

            const response = await fetch(`${apiBase}/upscale`, {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upscale image');
            }

            const data = await response.json();

            if (data.success && data.imageUrl) {
                // Resolve the image URL
                const serverOrigin = (() => {
                    const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
                    if (!raw) return '';
                    try {
                        const u = new URL(raw);
                        return `${u.protocol}//${u.host}`;
                    } catch {
                        return '';
                    }
                })();

                const resolvedUrl = data.imageUrl.startsWith('http')
                    ? data.imageUrl
                    : `${serverOrigin}${data.imageUrl}`;

                setState(prev => ({
                    ...prev,
                    upscaledImage: resolvedUrl,
                    isUpscaling: false
                }));
            } else {
                throw new Error('No upscaled image returned');
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                isUpscaling: false
            }));
        }
    };

    return {
        selectedImage: state.selectedImage,
        selectedResolution: state.selectedResolution,
        isUpscaling: state.isUpscaling,
        upscaledImage: state.upscaledImage,
        error: state.error,
        setSelectedImage,
        setSelectedResolution,
        upscaleImage,
        clearResults
    };
};
