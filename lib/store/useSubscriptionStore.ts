import { create } from 'zustand';
import { Purchases, CustomerInfo, Offerings, Package } from "@revenuecat/purchases-js";

interface SubscriptionState {
    customerInfo: CustomerInfo | null;
    offerings: Offerings | null;
    isPro: boolean;
    isLoading: boolean;
    initialize: (userId: string) => Promise<void>;
    purchasePackage: (pkg: Package) => Promise<void>;
    restorePurchases: () => Promise<void>;
}

let purchasesInstance: Purchases | null = null;

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
    customerInfo: null,
    offerings: null,
    isPro: false,
    isLoading: false,

    initialize: async (userId: string) => {
        set({ isLoading: true });
        try {
            if (!purchasesInstance) {
                purchasesInstance = await Purchases.configure({
                    apiKey: process.env.NEXT_PUBLIC_REVENUECAT_KEY!,
                    appUserId: userId,
                });
            }

            const customerInfo = await purchasesInstance.getCustomerInfo();
            const offerings = await purchasesInstance.getOfferings();

            const isPro = customerInfo.entitlements.active["Shortlist Pro"] !== undefined;

            set({ customerInfo, offerings, isPro, isLoading: false });
        } catch (error) {
            console.error("Failed to initialize subscription:", error);
            set({ isLoading: false });
        }
    },

    purchasePackage: async (pkg: Package) => {
        set({ isLoading: true });
        try {
            if (!purchasesInstance) throw new Error("Purchases not initialized");

            const { customerInfo } = await purchasesInstance.purchasePackage(pkg);
            const isPro = customerInfo.entitlements.active["Shortlist Pro"] !== undefined;
            set({ customerInfo, isPro, isLoading: false });
        } catch (error) {
            console.error("Purchase failed:", error);
            set({ isLoading: false });
            throw error;
        }
    },

    restorePurchases: async () => {
        set({ isLoading: true });
        try {
            if (!purchasesInstance) throw new Error("Purchases not initialized");

            // restorePurchases might not be on the type definition correctly for all versions
            const customerInfo = await (purchasesInstance as any).restorePurchases();
            const isPro = customerInfo.entitlements.active["Shortlist Pro"] !== undefined;
            set({ customerInfo, isPro, isLoading: false });
        } catch (error) {
            console.error("Restore failed:", error);
            set({ isLoading: false });
        }
    }
}));

