import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, getCurrentUserQuery } from "./users";

/**
 * Quota bookkeeping for the free tier.
 *
 * These counters are the enforcement point for the PRD's "limited job scan"
 * and watermarked-export limits, so they are deliberately server-side.
 * localStorage counters are reset by clearing site data.
 */

/** Current period key, "YYYY-MM". Mirrors lib/tiers.ts currentPeriod(). */
function periodOf(timestampMs: number): string {
    const d = new Date(timestampMs);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Job scans used by the current user this period. */
export const jobScansThisPeriod = query({
    args: { period: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await getCurrentUserQuery(ctx);
        if (!user) return 0;

        const period = args.period ?? periodOf(Date.now());
        const scans = await ctx.db
            .query("jobScans")
            .withIndex("by_user_period", (q) =>
                q.eq("userId", user._id).eq("period", period)
            )
            .collect();

        return scans.length;
    },
});

/**
 * Record a completed job-description scan.
 *
 * Re-analysing a JD already scanned this period is free. It returns the
 * existing count rather than inserting again, so iterating on a resume against
 * the same posting doesn't drain the quota.
 */
export const recordJobScan = mutation({
    args: {
        resumeId: v.optional(v.id("resumes")),
        jobDescriptionPreview: v.string(),
        jobDescriptionHash: v.string(),
        atsScore: v.number(),
        matchedKeywords: v.array(v.string()),
        missingKeywords: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthenticated");

        const period = periodOf(Date.now());

        const existing = await ctx.db
            .query("jobScans")
            .withIndex("by_user_period", (q) =>
                q.eq("userId", user._id).eq("period", period)
            )
            .collect();

        const alreadyScanned = existing.find(
            (s) => s.jobDescriptionHash === args.jobDescriptionHash
        );

        if (alreadyScanned) {
            // Refresh the stored result without consuming another scan.
            await ctx.db.patch(alreadyScanned._id, {
                atsScore: args.atsScore,
                matchedKeywords: args.matchedKeywords,
                missingKeywords: args.missingKeywords,
                resumeId: args.resumeId,
            });
            return { used: existing.length, period, counted: false };
        }

        await ctx.db.insert("jobScans", {
            userId: user._id,
            period,
            // Cap the stored preview so scan history stays bounded.
            jobDescriptionPreview: args.jobDescriptionPreview.slice(0, 500),
            jobDescriptionHash: args.jobDescriptionHash,
            resumeId: args.resumeId,
            atsScore: args.atsScore,
            matchedKeywords: args.matchedKeywords,
            missingKeywords: args.missingKeywords,
        });

        return { used: existing.length + 1, period, counted: true };
    },
});

/**
 * Has this exact JD already been scanned this period?
 * Lets the quota gate allow a repeat scan even when the user is at the limit.
 */
export const hasScannedHash = query({
    args: { jobDescriptionHash: v.string() },
    handler: async (ctx, args) => {
        const user = await getCurrentUserQuery(ctx);
        if (!user) return false;

        const period = periodOf(Date.now());
        const existing = await ctx.db
            .query("jobScans")
            .withIndex("by_user_period", (q) =>
                q.eq("userId", user._id).eq("period", period)
            )
            .collect();

        return existing.some((s) => s.jobDescriptionHash === args.jobDescriptionHash);
    },
});

/** Recent scan history for the dashboard. */
export const listJobScans = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const user = await getCurrentUserQuery(ctx);
        if (!user) return [];

        return await ctx.db
            .query("jobScans")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(args.limit ?? 20);
    },
});

/** Exports used by the current user this period. */
export const exportsThisPeriod = query({
    args: { period: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await getCurrentUserQuery(ctx);
        if (!user) return 0;

        const period = args.period ?? periodOf(Date.now());
        const row = await ctx.db
            .query("usage")
            .withIndex("by_user_period", (q) =>
                q.eq("userId", user._id).eq("period", period)
            )
            .unique();

        return row?.exportCount ?? 0;
    },
});

/**
 * Increment the export counter and return the new total.
 * Called after a successful export so failed renders don't burn quota.
 */
export const recordExport = mutation({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthenticated");

        const period = periodOf(Date.now());
        const row = await ctx.db
            .query("usage")
            .withIndex("by_user_period", (q) =>
                q.eq("userId", user._id).eq("period", period)
            )
            .unique();

        if (row) {
            const exportCount = row.exportCount + 1;
            await ctx.db.patch(row._id, { exportCount });
            return { used: exportCount, period };
        }

        await ctx.db.insert("usage", {
            userId: user._id,
            period,
            exportCount: 1,
        });
        return { used: 1, period };
    },
});
