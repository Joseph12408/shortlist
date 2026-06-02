import { useUser } from "@clerk/nextjs";

export const FREE_TEMPLATES = ['standard', 'classic', 'minimal', 'sidebar', 'sidebar_right', 'banner', 'efficient'];
export const PRO_TEMPLATES = ['modern', 'minimal'];

export function useFeatureAccess() {
    const { user, isLoaded } = useUser();

    // The user's requested email for lifetime pro, including all registered test accounts
    const isProForLife = [
        "josephnjuma793@gmail.com",
        "nkemvoudaniel@gmail.com",
        "obi.junior@icloud.com",
        "rozayozioma@gmail.com",
        "75dxwm827d@privaterelay.appleid.com"
    ].includes(user?.primaryEmailAddress?.emailAddress || "");
    // Check Clerk metadata for an active Polar subscription (also checking string values)
    const hasPolarPro = user?.publicMetadata?.isPro === true || user?.publicMetadata?.isPro === "true";

    // User is Pro if either condition is met
    const isPro = isProForLife || hasPolarPro;

    const checkFeatureAccess = (feature: string) => {
        if (isPro) return true;

        switch (feature) {
            case 'manual_build':
            case 'ats_grading':
            case 'standard_templates':
                return true;
            case 'ai_generation':
            case 'ai_cover_letter':
            case 'pdf_export':
            case 'docx_export':
            case 'premium_templates':
            case 'unlimited_saves':
                return false;
            default:
                return false;
        }
    };

    return {
        checkFeatureAccess,
        isPro,
        isLoaded
    };
}
