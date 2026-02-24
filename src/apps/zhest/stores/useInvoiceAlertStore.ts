import { create } from 'zustand';
import { apiClient } from '@/shared/services/api';
import { useLicenseStore } from './useLicenseStore';

interface InvoiceAlertState {
    pendingCount: number;
    fetched: boolean;
    fetch: () => Promise<void>;
}

export const useInvoiceAlertStore = create<InvoiceAlertState>((set) => ({
    pendingCount: 0,
    fetched: false,
    fetch: async () => {
        const shopId = useLicenseStore.getState().shopId;
        if (!shopId) return;
        try {
            const res = await apiClient.get(`/shops/${shopId}/pre-invoices`);
            const invoices = res.data.data || [];
            const pending = invoices.filter((i: any) => i.status === 'pending' || i.status === 'paid');
            set({ pendingCount: pending.length, fetched: true });
        } catch {
            set({ fetched: true });
        }
    },
}));
