/**
 * Single source of truth for what the free tier gets.
 *
 * Imported by both client components and server route guards. If a limit
 * changes it must change here, not in a component.
 */

/**
 * Lifetime-Pro developer account. Lives here rather than in
 * lib/subscription-server.ts so client components can import it without
 * pulling in the Clerk server SDK.
 */
export const LIFETIME_PRO_EMAIL = "josephnjuma793@gmail.com";

/** Free templates: the three ATS-safe layouts promised in the PRD. */
export const FREE_TEMPLATES = ["standard", "classic", "minimal"] as const;

/** Everything else is Pro. */
export const PRO_TEMPLATES = [
    "modern",
    "efficient",
    "sidebar",
    "sidebar_right",
    "banner",
] as const;

export type TemplateId = (typeof FREE_TEMPLATES)[number] | (typeof PRO_TEMPLATES)[number];

export function isTemplateFree(id: string): boolean {
    return (FREE_TEMPLATES as readonly string[]).includes(id);
}

/**
 * Job-description scans a free user gets per calendar month.
 * PRD section 7: "limited job scan" for free, unlimited for paid.
 */
export const FREE_MONTHLY_JOB_SCANS = 5;

/**
 * Watermarked PDF exports a free user gets per calendar month.
 * PRD section 7: free gets a watermarked preview; clean exports are paid.
 */
export const FREE_MONTHLY_EXPORTS = 3;

/** Current usage period key, e.g. "2026-07". Used to scope monthly counters. */
export function currentPeriod(date: Date = new Date()): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

/** How many feedback items a free user sees in the analysis view. */
export const FREE_VISIBLE_ISSUES = 3;

/**
 * Whop checkout plan IDs.
 *
 * Read from env so switching between Whop test and live plans, or changing
 * price, is a dashboard change rather than a code deploy. The literals are the
 * currently-live plans and act as a fallback so nothing breaks if the env vars
 * are not set yet.
 */
export const WHOP_PLAN_MONTHLY =
    process.env.NEXT_PUBLIC_WHOP_PLAN_MONTHLY || "plan_y608PYXGfix1q";

export const WHOP_PLAN_YEARLY =
    process.env.NEXT_PUBLIC_WHOP_PLAN_YEARLY || "plan_JEAL8xtw6h1Uo";
