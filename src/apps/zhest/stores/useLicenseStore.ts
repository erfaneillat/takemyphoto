import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/shared/services/api';

const updateManifest = (licenseKey: string | null) => {
    if (typeof window === 'undefined') return;

    let link: HTMLLinkElement | null = document.querySelector('link[rel="manifest"]');

    if (licenseKey) {
        if (!link) {
            link = document.createElement('link');
            link.rel = 'manifest';
            document.head.appendChild(link);
        }
        link.href = `/api/v1/shops/manifest/${licenseKey}`;
    } else if (link) {
        link.remove();
    }
};

interface LicenseState {
    licenseKey: string | null;
    shopId: string | null;
    shopName: string | null;
    logoWithBg: string | null;
    logoWithoutBg: string | null;
    shopTypes: string[];
    phoneNumber: string | null;
    address: string | null;
    ownerName: string | null;
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
function getOrCreateFingerprint(): string {
    const STORAGE_KEY = 'zhest_device_fingerprint';

    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return stored;
    }

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

    // We add a random suffix to ensure strict system-level uniqueness going forward,
    // while the prefix is somewhat deterministic based on browser.
    // This strictly prevents hash collisions between identical hardware setups.
    const baseHash = Math.abs(hash).toString(36).toUpperCase().padStart(8, '0');
    const newFingerprint = baseHash + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newFingerprint);
    }

    return newFingerprint;
}

const fingerprint = getOrCreateFingerprint();

export const useLicenseStore = create<LicenseStore>()(
    persist(
        (set, get) => ({
            licenseKey: null,
            shopId: null,
            shopName: null,
            logoWithBg: null,
            logoWithoutBg: null,
            shopTypes: [],
            phoneNumber: null,
            address: null,
            ownerName: null,
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
                    updateManifest(key.toUpperCase());
                    set({
                        licenseKey: key.toUpperCase(),
                        shopId: shop.id || shop._id || null,
                        shopName: shop.name,
                        logoWithBg: shop.logoWithBg || null,
                        logoWithoutBg: shop.logoWithoutBg || null,
                        shopTypes: shop.types || [],
                        phoneNumber: shop.phoneNumber || null,
                        address: shop.address || null,
                        ownerName: shop.ownerName || null,
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
                        shopId: shop.id || shop._id || null,
                        shopName: shop.name,
                        logoWithBg: shop.logoWithBg || null,
                        logoWithoutBg: shop.logoWithoutBg || null,
                        shopTypes: shop.types || [],
                        phoneNumber: shop.phoneNumber || null,
                        address: shop.address || null,
                        ownerName: shop.ownerName || null,
                        licenseExpiresAt: shop.licenseExpiresAt || null,
                        credit: shop.credit ?? 0,
                    });
                } catch {
                    // Silently fail — data will just not be refreshed
                }
            },

            reset: () => {
                updateManifest(null);
                set({
                    licenseKey: null,
                    shopId: null,
                    shopName: null,
                    logoWithBg: null,
                    logoWithoutBg: null,
                    shopTypes: [],
                    phoneNumber: null,
                    address: null,
                    ownerName: null,
                    licenseExpiresAt: null,
                    credit: 0,
                    isActivated: false,
                    isLoading: false,
                    error: null,
                });
            },

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
                shopId: state.shopId,
                shopName: state.shopName,
                logoWithBg: state.logoWithBg,
                logoWithoutBg: state.logoWithoutBg,
                shopTypes: state.shopTypes,
                phoneNumber: state.phoneNumber,
                address: state.address,
                ownerName: state.ownerName,
                licenseExpiresAt: state.licenseExpiresAt,
                credit: state.credit,
                isActivated: state.isActivated,
            }),
            // Hook into rehydration to set the manifest if we already have a key
            onRehydrateStorage: () => (state: any) => {
                if (state?.licenseKey) {
                    updateManifest(state.licenseKey);
                }
            }
        }
    )
);
