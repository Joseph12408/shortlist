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
            // Rely on Clerk's publicMetadata or check the registered test emails
            const email = user?.primaryEmailAddress?.emailAddress;
            const isProForLife = [
                "josephnjuma793@gmail.com",
                "nkemvoudaniel@gmail.com",
                "obi.junior@icloud.com",
                "rozayozioma@gmail.com",
                "75dxwm827d@privaterelay.appleid.com"
            ].includes(email || "");
            const isPro = isProForLife || user?.publicMetadata?.isPro === true || user?.publicMetadata?.isPro === "true";
            set({ isPro, isLoading: false });
        } catch (error) {
            console.error("Failed to initialize subscription:", error);
            set({ isLoading: false });
        }
    },
}));
