import { MutationCtx, QueryCtx, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current user's document, creating it if it doesn't exist.
 * This ensures we always have a valid `users` document to reference.
 */
export async function getCurrentUser(ctx: MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        return null;
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

    if (user) {
        return user;
    }

    // Create user on the fly
    const newUserId = await ctx.db.insert("users", {
        name: identity.name || "Anonymous",
        email: identity.email || "",
        picture: identity.pictureUrl,
        clerkId: identity.subject,
    });

    return await ctx.db.get(newUserId);
}

export async function getCurrentUserQuery(ctx: QueryCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        return null;
    }

    return await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
}
