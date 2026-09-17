/**
 * Pure helpers for deciding whether a Whop memberships response proves that a
 * given email is an active member.
 *
 * Deliberately free of any Clerk/Next/environment imports so it can be unit
 * tested in isolation and shared by both the request-path entitlement check
 * (lib/subscription-server.ts) and the reconcile script (scripts/reconcile-pro.ts).
 *
 * THE RULE THAT MATTERS: a membership only counts if it demonstrably belongs to
 * THIS email. We do not trust the Whop `?email=` query filter. If that filter is
 * ignored and the endpoint returns the whole account's memberships, matching on
 * "any active membership" hands Pro to every caller who shares the account with
 * one paying member. That was a real, costly bug; this module exists so it stays
 * fixed.
 */

export interface WhopMembership {
    id?: string;
    email?: string;
    user?: { email?: string };
    valid?: boolean;
    status?: string;
}

/** Statuses Whop reports for a membership that is currently entitled. */
const ACTIVE_STATUSES = ["active", "valid", "went_valid", "trialing"];

/** Normalise the shapes the Whop endpoint may return into a plain array. */
export function extractMemberships(data: unknown): WhopMembership[] {
    const d = data as Record<string, unknown> | unknown[] | null;
    if (Array.isArray(d)) return d as WhopMembership[];
    const items =
        (d as Record<string, unknown>)?.items ??
        (d as Record<string, unknown>)?.data ??
        d;
    return Array.isArray(items) ? (items as WhopMembership[]) : [];
}

/** True only if this membership is active AND belongs to `email`. */
export function isActiveMembershipForEmail(m: WhopMembership, email: string): boolean {
    if (!email) return false;
    const memberEmail = String(m?.email ?? m?.user?.email ?? "").toLowerCase();
    if (!memberEmail || memberEmail !== email.toLowerCase()) return false;
    return m?.valid === true || (typeof m?.status === "string" && ACTIVE_STATUSES.includes(m.status));
}

/**
 * The caller's active membership from a Whop response, or null. Never returns a
 * membership belonging to a different email.
 */
export function findActiveMembership(data: unknown, email: string): WhopMembership | null {
    if (!email) return null;
    return extractMemberships(data).find((m) => isActiveMembershipForEmail(m, email)) ?? null;
}
