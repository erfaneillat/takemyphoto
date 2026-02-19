import { create } from 'zustand';

interface ReferenceImageState {
    referenceImageUrl: string | null;
    setReferenceImageUrl: (url: string) => void;
    clearReferenceImageUrl: () => void;
}

export const useReferenceImageStore = create<ReferenceImageState>((set) => ({
    referenceImageUrl: null,
    setReferenceImageUrl: (url) => set({ referenceImageUrl: url }),
    clearReferenceImageUrl: () => set({ referenceImageUrl: null }),
}));
