import type { AxiosError } from 'axios';
import { toast } from '../stores/toastStore';

/**
 * Extract error message from API error response
 * Handles both Axios errors and regular errors
 */
export const getErrorMessage = (error: unknown): string => {
    if (!error) return 'Unknown error occurred';

    // Check if it's an Axios error with response data
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    if (axiosError.response?.data) {
        const data = axiosError.response.data;
        if (typeof data === 'string') return data;
        if (data.message) return data.message;
        if (data.error) return data.error;
    }

    // Check if it's a regular Error object
    if (error instanceof Error) {
        return error.message;
    }

    // Fallback for unknown error types
    if (typeof error === 'string') return error;

    return 'Unknown error occurred';
};

/**
 * Check if error is due to insufficient stars
 */
export const isInsufficientStarsError = (error: unknown): boolean => {
    const message = getErrorMessage(error);
    return message.includes('INSUFFICIENT_STARS');
};

/**
 * Handle insufficient stars error - show toast and redirect to subscription
 * Returns true if it was an insufficient stars error
 */
export const handleInsufficientStarsError = (
    error: unknown,
    setError: (msg: string) => void,
    navigate: (path: string) => void,
    t: (key: string) => string
): boolean => {
    if (isInsufficientStarsError(error)) {
        const message = t('common.insufficientStars');
        // Show toast notification
        toast.error(message, 3000);
        // Also set error state for components that display it
        setError(message);
        // Navigate to subscription page after showing error
        setTimeout(() => {
            navigate('/subscription');
        }, 2500);
        return true;
    }
    return false;
};
