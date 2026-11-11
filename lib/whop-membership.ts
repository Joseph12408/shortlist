/**
 * Decide whether a given email is an active Whop member, using the current
 * Whop API (https://api.whop.com/api/v1). API v2 is shut off on 2026-11-13.
 *
 * Shared by the request-path entitlement check (lib/subscription-server.ts)
 * and the reconcile script (scripts/reconcile-pro.ts), so the two can never
 * disagree about who is a member.
 *
 * How the lookup works in the current API:
 *   1. GET /members?query=<email>. Memberships carry no email and cannot be
 *      filtered by one, so the email is resolved to a member (`mber_`) first.
 *      The member's `email` is only filled in when the API key has
 *      `member:email:read`; without it nothing matches and nobody gets Pro.
 *   2. GET /memberships?member_id=<mber_>. Confirms the member really holds an
 *      active membership, and gives the `mem_` ID we store in Clerk.
 *
 * THE RULE THAT MATTERS: a membership only counts if it demonstrably belongs to
 * THIS email. We do not trust Whop's query filters. `query` also matches names
 * and usernames, and an ignored filter once returned the whole account's
 * memberships, which handed Pro to every free user on the account. So every
 * result is re-checked here: the member's email must equal the caller's, and
 * the membership must point back at that member and be active. That was a
 * real, costly bug; this module exists so it stays fixed.
 *
 * The pure helpers below have no Clerk/Next/environment imports so they can be
 * unit tested in isolation. `lookupWhopMembership` takes the key and `fetch`
 * as arguments for the same reason.
 */

export const WHOP_API_BASE = "https://api.whop.com/api/v1";

/** Pins the response format so a future Whop release can't change it under us. */
export const WHOP_API_VERSION_DATE = "2026-11-10-1";

export interface WhopMember {
    id?: string;
    email?: string | null;
    status?: string;
}

export interface WhopMembership {
    id?: string;
    member_id?: string | null;
    status?: string;
}

/** Membership statuses that currently grant access. */
const ACTIVE_STATUSES = ["active", "trialing"];

/** Pull the `data` array out of a current-API list response. */
export function extractList<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    const items = (data as Record<string, unknown> | null)?.data;
    return Array.isArray(items) ? (items as T[]) : [];
}

/**
 * The member whose email is exactly `email` (case-insensitive), or null.
 * Never returns a member that merely matched on name or username.
 */
export function findMemberByEmail(data: unknown, email: string): WhopMember | null {
    if (!email) return null;
    const wanted = email.toLowerCase();
    return (
        extractList<WhopMember>(data).find(
            (m) =>
                !!m?.id &&
                typeof m.email === "string" &&
                m.email.toLowerCase() === wanted &&
                m.status !== "left"
        ) ?? null
    );
}

/** True only if this membership belongs to `memberId` and is active. */
export function isActiveMembershipForMember(m: WhopMembership, memberId: string): boolean {
    if (!memberId) return false;
    if (m?.member_id !== memberId) return false;
    return typeof m?.status === "string" && ACTIVE_STATUSES.includes(m.status);
}

/** The member's active membership from a /memberships response, or null. */
export function findActiveMembershipForMember(data: unknown, memberId: string): WhopMembership | null {
    if (!memberId) return null;
    return (
        extractList<WhopMembership>(data).find((m) => isActiveMembershipForMember(m, memberId)) ??
        null
    );
}

export type WhopLookupResult =
    | { status: "active"; membershipId: string | null }
    | { status: "none" }
    | { status: "error"; reason: string };

/**
 * Ask Whop whether `email` currently holds an active membership.
 *
 * Returns "error" (never "none") when Whop can't be reached or refuses the
 * request, so callers can tell "not a member" apart from "couldn't check".
 */
export async function lookupWhopMembership(
    email: string,
    apiKey: string,
    fetchImpl: typeof fetch = fetch
): Promise<WhopLookupResult> {
    if (!email) return { status: "none" };

    const get = async (path: string): Promise<unknown> => {
        const res = await fetchImpl(`${WHOP_API_BASE}${path}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Api-Version-Date": WHOP_API_VERSION_DATE,
            },
        });
        if (!res.ok) {
            throw new Error(`Whop ${path.split("?")[0]} returned HTTP ${res.status}`);
        }
        return res.json();
    };

    try {
        const members = await get(
            `/members?query=${encodeURIComponent(email)}&membership_status=active&first=100`
        );
        const member = findMemberByEmail(members, email);
        if (!member?.id) return { status: "none" };

        const memberships = await get(
            `/memberships?member_id=${encodeURIComponent(member.id)}&first=100`
        );
        const active = findActiveMembershipForMember(memberships, member.id);
        if (!active) return { status: "none" };

        return { status: "active", membershipId: active.id ?? null };
    } catch (e) {
        return { status: "error", reason: e instanceof Error ? e.message : String(e) };
    }
}
