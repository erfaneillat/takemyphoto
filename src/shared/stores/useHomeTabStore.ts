import { create } from 'zustand';

interface HomeTabState {
    activeTab: 0 | 1 | 2;
    setActiveTab: (tab: 0 | 1 | 2) => void;
}

export const useHomeTabStore = create<HomeTabState>((set) => ({
    activeTab: 0,
    setActiveTab: (tab) => set({ activeTab: tab }),
}));
