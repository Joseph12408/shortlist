import { Purchases, LogLevel } from "@revenuecat/purchases-js";

const API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_KEY;

if (!API_KEY) {
    console.error("RevenueCat API key is missing. Please set NEXT_PUBLIC_REVENUECAT_KEY in your .env.local");
}

class RevenueCatService {
    private static instance: RevenueCatService;
    private isConfigured = false;

    private constructor() { }

    public static getInstance(): RevenueCatService {
        if (!RevenueCatService.instance) {
            RevenueCatService.instance = new RevenueCatService();
        }
        return RevenueCatService.instance;
    }

    public async configure(appUserId: string) {
        if (this.isConfigured) return;
        if (!API_KEY) return;

        try {
            Purchases.setLogLevel(LogLevel.DEBUG); // Enable debug logs for development
            await Purchases.configure({
                apiKey: API_KEY,
                appUserId: appUserId, // Clerk User ID
            });
            this.isConfigured = true;
            console.log("RevenueCat configured successfully for user:", appUserId);
        } catch (error) {
            console.error("Failed to configure RevenueCat:", error);
        }
    }

    public getPurchases() {
        return Purchases;
    }
}

export const revenueCatService = RevenueCatService.getInstance();
