import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/shared/services/api';

interface LicenseState {
    licenseKey: string | null;
    shopName: string | null;
    shopTypes: string[];
    licenseExpiresAt: string | null;
    credit: number;
    isActivated: boolean;
    isLoading: boolean;
    error: string | null;
    deviceFingerprint: string;
}

interface LicenseStore extends LicenseState {
    activate: (key: string) => Promise<void>;
    refreshLicenseInfo: () => Promise<void>;
    clearError: () => void;
    reset: () => void;
    isExpired: () => boolean;
    remainingDays: () => number | null;
}

/**
 * Generate a simple but stable browser fingerprint.
 * Uses canvas, screen, timezone, language, and user-agent to create a hash.
 */
function generateFingerprint(): string {
    const components = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 'unknown',
    ];

    // Simple hash
    const str = components.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).toUpperCase().padStart(8, '0');
}

const fingerprint = generateFingerprint();

export const useLicenseStore = create<LicenseStore>()(
    persist(
        (set, get) => ({
            licenseKey: null,
            shopName: null,
            shopTypes: [],
            licenseExpiresAt: null,
            credit: 0,
            isActivated: false,
            isLoading: false,
            error: null,
            deviceFingerprint: fingerprint,

            activate: async (key: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.post('/shops/activate', {
                        licenseKey: key.toUpperCase(),
                        deviceFingerprint: fingerprint,
                    });

                    const shop = response.data.data.shop;
                    set({
                        licenseKey: key.toUpperCase(),
                        shopName: shop.name,
                        shopTypes: shop.types || [],
                        licenseExpiresAt: shop.licenseExpiresAt || null,
                        credit: shop.credit ?? 0,
                        isActivated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Failed to activate license';
                    set({ error: message, isLoading: false });
                    throw new Error(message);
                }
            },

            clearError: () => set({ error: null }),

            refreshLicenseInfo: async () => {
                const { licenseKey } = get();
                if (!licenseKey) return;
                try {
                    const response = await apiClient.get(`/shops/info?licenseKey=${licenseKey}`);
                    const shop = response.data.data.shop;
                    set({
                        shopName: shop.name,
                        shopTypes: shop.types || [],
                        licenseExpiresAt: shop.licenseExpiresAt || null,
                        credit: shop.credit ?? 0,
                    });
                } catch {
                    // Silently fail — data will just not be refreshed
                }
            },

            reset: () => set({
                licenseKey: null,
                shopName: null,
                shopTypes: [],
                licenseExpiresAt: null,
                credit: 0,
                isActivated: false,
                isLoading: false,
                error: null,
            }),

            isExpired: () => {
                const { licenseExpiresAt } = get();
                if (!licenseExpiresAt) return false;
                return new Date(licenseExpiresAt) < new Date();
            },

            remainingDays: () => {
                const { licenseExpiresAt } = get();
                if (!licenseExpiresAt) return null;
                const diff = new Date(licenseExpiresAt).getTime() - Date.now();
                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                return days > 0 ? days : 0;
            },
        }),
        {
            name: 'zhest-license-storage',
            partialize: (state) => ({
                licenseKey: state.licenseKey,
                shopName: state.shopName,
                shopTypes: state.shopTypes,
                licenseExpiresAt: state.licenseExpiresAt,
                credit: state.credit,
                isActivated: state.isActivated,
            }),
        }
    )
);
