import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Storage for the public /contact form.
 *
 * These run unauthenticated on purpose: the contact form is open to logged-out
 * visitors, so there is no session to check. The API route in front of them is
 * rate-limited and bot-checked by Arcjet; this layer just makes sure a message
 * is durably stored before the notification email is even attempted, so nothing
 * a user sends can be lost to an email outage.
 */

const categoryValidator = v.union(
    v.literal("question"),
    v.literal("suggestion"),
    v.literal("problem"),
    v.literal("other"),
);

/**
 * Store one contact message. Returns its id so the caller can mark it emailed
 * once the notification has actually gone out.
 */
export const submit = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        category: categoryValidator,
        message: v.string(),
        clerkId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Defensive caps: Convex validators check types, not lengths, and this
        // runs unauthenticated, so a row must stay bounded even if someone posts
        // straight to Convex and bypasses the route's Zod validation.
        const name = args.name.trim().slice(0, 200);
        const email = args.email.trim().slice(0, 320);
        const message = args.message.trim().slice(0, 5000);

        if (!name || !email || !message) {
            throw new Error("Name, email and message are required");
        }

        return await ctx.db.insert("contactMessages", {
            name,
            email,
            category: args.category,
            message,
            clerkId: args.clerkId,
            emailed: false,
            handled: false,
        });
    },
});

/** Flag a stored message as successfully emailed to the team. */
export const markEmailed = mutation({
    args: { id: v.id("contactMessages") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { emailed: true });
    },
});
