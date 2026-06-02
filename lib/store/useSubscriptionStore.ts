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
            // Rely on Clerk's publicMetadata or developer bypass
            const email = user?.primaryEmailAddress?.emailAddress;
            const isProForLife = email === "josephnjuma793@gmail.com";
            const isPro = isProForLife || user?.publicMetadata?.isPro === true || user?.publicMetadata?.isPro === "true";
            set({ isPro, isLoading: false });
        } catch (error) {
            console.error("Failed to initialize subscription:", error);
            set({ isLoading: false });
        }
    },
}));
