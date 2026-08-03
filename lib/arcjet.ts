import arcjet, { tokenBucket, detectBot } from "@arcjet/next";

/**
 * Rate limiting for the API routes.
 *
 * Previously a single 10 tokens/hour bucket was shared by every route, so a
 * paying user who optimized a resume and exported it twice was locked out for
 * the rest of the hour. Instead there is now one bucket per tier, and each
 * route spends an amount proportional to what it actually costs us.
 *
 * All of these routes are already auth-gated, so the bucket is keyed on the
 * Clerk userId rather than IP.
 */

/** What each operation costs against the hourly budget. */
export const COST = {
    /** Gemini call over the whole resume. Slowest and most expensive. */
    aiGenerate: 10,
    /** Gemini call for a cover letter. */
    aiCoverLetter: 10,
    /** Headless Chromium render. */
    pdfExport: 5,
    /** Gemini call to parse an uploaded file. */
    parse: 3,
    /** Cheap Convex read/write. Called often while editing. */
    jobScan: 1,
} as const;

const BOT_RULE = detectBot({
    mode: "LIVE",
    allow: [],
});

/**
 * Free tier: 60 points/hour. Enough for roughly 6 optimizations, or 12 PDF
 * exports, or 20 uploads, well past what the free feature caps allow anyway.
 */
const freeLimiter = arcjet({
    key: process.env.ARCJET_KEY!,
    characteristics: ["userId"],
    rules: [
        tokenBucket({
            mode: "LIVE",
            refillRate: 60,
            interval: "1h",
            capacity: 60,
        }),
        BOT_RULE,
    ],
});

/**
 * Pro tier: 600 points/hour, i.e. ~60 optimizations. High enough that a real
 * subscriber never sees it, low enough to contain a leaked session or a runaway
 * client-side loop.
 */
const proLimiter = arcjet({
    key: process.env.ARCJET_KEY!,
    characteristics: ["userId"],
    rules: [
        tokenBucket({
            mode: "LIVE",
            refillRate: 600,
            interval: "1h",
            capacity: 600,
        }),
        BOT_RULE,
    ],
});

/** Pick the bucket matching the caller's tier. */
export function getLimiter(isPro: boolean) {
    return isPro ? proLimiter : freeLimiter;
}

/** Default export kept for any caller that just needs the free-tier rules. */
export default freeLimiter;
