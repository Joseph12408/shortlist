import arcjet, { tokenBucket, detectBot } from "@arcjet/next";

// Create the Arcjet instance
export default arcjet({
    key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
    characteristics: ["userId"], // Track based on Clerk userId
    rules: [
        // Rate limit: 10 requests per hour per user
        tokenBucket({
            mode: "LIVE", // will block requests. Use "DRY_RUN" to just log.
            refillRate: 10, // Refill 10 tokens per interval
            interval: "1h", // Interval of 1 hour
            capacity: 10, // Max burst capacity
        }),
        // Bot protection
        detectBot({
            mode: "LIVE", // will block requests. Use "DRY_RUN" to just log.
            allow: [], // "CAT:SEARCH_ENGINE" to allow search engines
        }),
    ],
});
