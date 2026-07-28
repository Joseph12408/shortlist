import { useUser } from "@clerk/nextjs";

import { useSubscriptionStore } from "@/lib/store/useSubscriptionStore";
import { LIFETIME_PRO_EMAIL, FREE_TEMPLATES, PRO_TEMPLATES, isTemplateFree } from "@/lib/tiers";

export { FREE_TEMPLATES, PRO_TEMPLATES, isTemplateFree };

/**
 * Features gated behind Pro. Keys are shared with the server-side route guards
 * so the UI and the API agree on what "Pro" unlocks.
 */
export type Feature =
    | "manual_build"
    | "ats_score"
    | "ats_detailed_feedback"
    | "job_scan"
    | "standard_templates"
    | "premium_templates"
    | "ai_generation"
    | "ai_cover_letter"
    | "pdf_export"
    | "docx_export"
    | "watermark_free_export"
    | "unlimited_saves";

/** Features a signed-in free user can use (some with limits enforced server-side). */
const FREE_FEATURES: readonly Feature[] = [
    "manual_build",
    "ats_score",
    "job_scan", // capped, see FREE_MONTHLY_JOB_SCANS
    "standard_templates",
    "pdf_export", // watermarked + capped, see FREE_MONTHLY_EXPORTS
];

export function useFeatureAccess() {
    const { user, isLoaded } = useUser();
    const { isPro: storeIsPro } = useSubscriptionStore();

    // Lifetime Pro for the developer account.
    const isProForLife = user?.primaryEmailAddress?.emailAddress === LIFETIME_PRO_EMAIL;
    // Clerk metadata, kept current by the Whop webhook and /api/subscription/check.
    const hasPaidPro =
        user?.publicMetadata?.isPro === true || user?.publicMetadata?.isPro === "true";

    const isPro = isProForLife || hasPaidPro || storeIsPro;

    const checkFeatureAccess = (feature: Feature) => {
        if (isPro) return true;
        return FREE_FEATURES.includes(feature);
    };

    return {
        checkFeatureAccess,
        isPro,
        isLoaded,
    };
}
