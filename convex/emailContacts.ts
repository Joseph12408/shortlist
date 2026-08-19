import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Email suppression and onboarding-sequence bookkeeping.
 *
 * These run unauthenticated on purpose: unsubscribe links are followed from an
 * inbox with no session, and the webhook that queues onboarding mail runs as
 * the server, not as the user. Access is therefore scoped by knowing the exact
 * email address, and the HTTP layer gates unsubscribe behind a signed token.
 */

function normalise(email: string): string {
    return email.trim().toLowerCase();
}

/** Has this address opted out? Checked before every marketing send. */
export const isUnsubscribed = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const row = await ctx.db
            .query("emailContacts")
            .withIndex("by_email", (q) => q.eq("email", normalise(args.email)))
            .unique();

        return row?.unsubscribed ?? false;
    },
});

/** Record the Resend ids queued for an address so they can be cancelled later. */
export const recordPending = mutation({
    args: { email: v.string(), emailIds: v.array(v.string()) },
    handler: async (ctx, args) => {
        const email = normalise(args.email);
        const row = await ctx.db
            .query("emailContacts")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (row) {
            await ctx.db.patch(row._id, {
                pendingEmailIds: [...row.pendingEmailIds, ...args.emailIds],
            });
            return;
        }

        await ctx.db.insert("emailContacts", {
            email,
            unsubscribed: false,
            pendingEmailIds: args.emailIds,
        });
    },
});

/**
 * Mark an address unsubscribed and hand back the still-queued Resend ids so the
 * caller can cancel them. Without this, mail scheduled days ago keeps arriving
 * after someone has opted out.
 */
export const unsubscribe = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const email = normalise(args.email);
        const row = await ctx.db
            .query("emailContacts")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (!row) {
            // Opting out before any mail was queued is still a valid opt-out.
            await ctx.db.insert("emailContacts", {
                email,
                unsubscribed: true,
                unsubscribedAt: Date.now(),
                pendingEmailIds: [],
            });
            return { cancelIds: [] as string[] };
        }

        const cancelIds = row.pendingEmailIds;

        await ctx.db.patch(row._id, {
            unsubscribed: true,
            unsubscribedAt: Date.now(),
            pendingEmailIds: [],
        });

        return { cancelIds };
    },
});
