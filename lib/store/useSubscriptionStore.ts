import { create } from 'zustand';

interface SubscriptionState {
    isPro: boolean;
    isLoading: boolean;
    initialize: (user: any) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
    isPro: false,
    isLoading: false,

    initialize: async (user: any) => {
        set({ isLoading: true });
        try {
            // Rely on Clerk's publicMetadata for Pro status
            const isPro = user?.publicMetadata?.isPro === true;
            set({ isPro, isLoading: false });
        } catch (error) {
            console.error("Failed to initialize subscription:", error);
            set({ isLoading: false });
        }
    },
}));
