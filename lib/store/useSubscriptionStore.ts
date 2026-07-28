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
            const email = user?.primaryEmailAddress?.emailAddress;
            const isProForLife = email === "josephnjuma793@gmail.com";
            let isPro = isProForLife || user?.publicMetadata?.isPro === true || user?.publicMetadata?.isPro === "true";
            
            if (!isPro) {
                const res = await fetch("/api/subscription/check");
                if (res.ok) {
                    const data = await res.json();
                    if (data.isPro) {
                        isPro = true;
                    }
                }
            }
            set({ isPro, isLoading: false });
        } catch (error) {
            console.error("Failed to initialize subscription:", error);
            set({ isLoading: false });
        }
    },
}));
