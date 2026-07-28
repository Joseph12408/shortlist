import { auth, currentUser, createClerkClient } from "@clerk/nextjs/server";
import { LIFETIME_PRO_EMAIL } from "./tiers";

/**
 * Server-side source of truth for subscription entitlement.
 *
 * The client hook (`useFeatureAccess`) decides what the UI *shows*. It cannot
 * decide what the API *serves*. Anyone can call a route directly. Every paid
 * route must gate on `getEntitlement()` before doing paid work.
 */

const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

export { LIFETIME_PRO_EMAIL };

export interface Entitlement {
    userId: string | null;
    email: string | null;
    isPro: boolean;
}

/**
 * Fast entitlement read: Clerk session + publicMetadata only, no outbound calls.
 *
 * `publicMetadata.isPro` is kept current by the Whop webhook (on activation and
 * cancellation) and self-healed by `/api/subscription/check`, so this is
 * authoritative for request-path gating without adding vendor latency.
 */
export async function getEntitlement(): Promise<Entitlement> {
    const { userId } = await auth();
    if (!userId) {
        return { userId: null, email: null, isPro: false };
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress ?? null;

    if (email === LIFETIME_PRO_EMAIL) {
        return { userId, email, isPro: true };
    }

    const meta = user?.publicMetadata;
    const isPro = meta?.isPro === true || meta?.isPro === "true";

    return { userId, email, isPro };
}

/**
 * Authoritative entitlement check that queries Whop directly and repairs
 * stale Clerk metadata.
 *
 * Slower (one outbound API call), use only where freshness matters more than
 * latency, i.e. the explicit `/api/subscription/check` endpoint and
 * post-checkout confirmation. Request-path gating should use `getEntitlement()`.
 */
export async function getEntitlementWithSync(): Promise<Entitlement> {
    const fast = await getEntitlement();
    if (!fast.userId || !fast.email || fast.isPro) {
        return fast;
    }

    const { userId, email } = fast;
    let isPro = false;
    let whopMembershipId: string | null = null;

    if (process.env.WHOP_API_KEY) {
        try {
            const res = await fetch(
                `https://api.whop.com/v2/memberships?email=${encodeURIComponent(email)}`,
                { headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` } }
            );
            if (res.ok) {
                const data = await res.json();
                const items = data.items || data.data || data;
                if (Array.isArray(items)) {
                    const active = items.find(
                        (m: any) =>
                            m.valid === true ||
                            ["active", "valid", "went_valid", "completed", "trialing"].includes(m.status)
                    );
                    if (active) {
                        isPro = true;
                        whopMembershipId = active.id;
                    }
                }
            }
        } catch (e) {
            console.error("[ENTITLEMENT] Whop check failed:", e);
        }
    }

    // Repair Clerk metadata so the fast path is correct next time.
    if (isPro) {
        try {
            const user = await currentUser();
            await clerk.users.updateUserMetadata(userId, {
                publicMetadata: {
                    ...user?.publicMetadata,
                    isPro: true,
                    whopMembershipId,
                    selfHealedAt: new Date().toISOString(),
                },
            });
            console.log(`[ENTITLEMENT] Self-healed Pro metadata for ${userId} (${email})`);
        } catch (e) {
            console.error("[ENTITLEMENT] Failed to self-heal Clerk metadata:", e);
        }
    }

    return { userId, email, isPro };
}

/** Standard 402 body for a free user hitting a Pro-only route. */
export const PRO_REQUIRED_RESPONSE = {
    error: "pro_required",
    message: "This feature requires a Shortlist Pro subscription.",
} as const;
