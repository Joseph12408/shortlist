import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, getCurrentUserQuery } from "./users";

/** Keep history bounded so a heavy user's dashboard stays fast. */
const MAX_STORED_ANALYSES = 50;

/** Record a completed AI review. */
export const record = mutation({
    args: {
        resumeId: v.optional(v.id("resumes")),
        resumeTitle: v.string(),
        overallScore: v.number(),
        categoryScores: v.array(
            v.object({
                name: v.string(),
                score: v.number(),
                maxScore: v.number(),
            })
        ),
        issueCounts: v.object({
            errors: v.number(),
            warnings: v.number(),
            successes: v.number(),
        }),
        feedback: v.array(
            v.object({
                category: v.string(),
                message: v.string(),
                detail: v.optional(v.string()),
                solution: v.optional(v.string()),
                type: v.string(),
                scoreImpact: v.number(),
            })
        ),
        jobDescriptionPreview: v.optional(v.string()),
        missingKeywords: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthenticated");

        const id = await ctx.db.insert("analyses", {
            userId: user._id,
            ...args,
            jobDescriptionPreview: args.jobDescriptionPreview?.slice(0, 300),
            missingKeywords: args.missingKeywords.slice(0, 30),
        });

        // Trim the oldest entries beyond the cap.
        const all = await ctx.db
            .query("analyses")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();

        for (const stale of all.slice(MAX_STORED_ANALYSES)) {
            await ctx.db.delete(stale._id);
        }

        return id;
    },
});

/** Review history, newest first. */
export const list = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUserQuery(ctx);
        if (!user) return [];

        return await ctx.db
            .query("analyses")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    },
});

/** A single stored review, for the detail view. */
export const get = query({
    args: { id: v.id("analyses") },
    handler: async (ctx, args) => {
        const user = await getCurrentUserQuery(ctx);
        if (!user) return null;

        const doc = await ctx.db.get(args.id);
        if (!doc || doc.userId !== user._id) return null;
        return doc;
    },
});

export const remove = mutation({
    args: { id: v.id("analyses") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthenticated");

        const existing = await ctx.db.get(args.id);
        if (!existing || existing.userId !== user._id) {
            throw new Error("Analysis not found or unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});
