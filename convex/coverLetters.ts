import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, getCurrentUserQuery } from "./users";

export const create = mutation({
    args: {
        title: v.string(),
        jobTitle: v.string(),
        company: v.string(),
        recipient: v.string(),
        body: v.string(),
        resumeId: v.optional(v.id("resumes")),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthenticated");

        return await ctx.db.insert("coverLetters", {
            userId: user._id,
            ...args,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("coverLetters"),
        title: v.optional(v.string()),
        jobTitle: v.optional(v.string()),
        company: v.optional(v.string()),
        recipient: v.optional(v.string()),
        body: v.optional(v.string()),
        resumeId: v.optional(v.id("resumes")),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthenticated");

        const existing = await ctx.db.get(args.id);
        if (!existing || existing.userId !== user._id) {
            throw new Error("Cover letter not found or unauthorized");
        }

        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const remove = mutation({
    args: { id: v.id("coverLetters") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthenticated");

        const existing = await ctx.db.get(args.id);
        if (!existing || existing.userId !== user._id) {
            throw new Error("Cover letter not found or unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

export const get = query({
    args: { id: v.id("coverLetters") },
    handler: async (ctx, args) => {
        const user = await getCurrentUserQuery(ctx);
        if (!user) return null;

        const doc = await ctx.db.get(args.id);
        if (!doc || doc.userId !== user._id) return null;
        return doc;
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUserQuery(ctx);
        if (!user) return [];

        return await ctx.db
            .query("coverLetters")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    },
});
