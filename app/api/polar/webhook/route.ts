import { Webhooks } from "@polar-sh/nextjs";
import { clerkClient } from "@clerk/nextjs/server";

export const POST = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

    onSubscriptionActive: async (payload) => {
        const email = payload.data.customer.email;
        if (!email) return;

        try {
            const clerk = await clerkClient();
            const users = await clerk.users.getUserList({ emailAddress: [email] });
            if (users.data.length > 0) {
                const user = users.data[0];
                await clerk.users.updateUserMetadata(user.id, {
                    publicMetadata: {
                        isPro: true,
                        polarSubscriptionId: payload.data.id,
                    },
                });
            }
        } catch (error) {
            console.error("Failed to activate subscription for", email, error);
        }
    },

    onSubscriptionCanceled: async (payload) => {
        const email = payload.data.customer.email;
        if (!email) return;

        try {
            const clerk = await clerkClient();
            const users = await clerk.users.getUserList({ emailAddress: [email] });
            if (users.data.length > 0) {
                const user = users.data[0];
                await clerk.users.updateUserMetadata(user.id, {
                    publicMetadata: {
                        isPro: false,
                        polarSubscriptionId: null,
                    },
                });
            }
        } catch (error) {
            console.error("Failed to cancel subscription for", email, error);
        }
    },

    onSubscriptionRevoked: async (payload) => {
        const email = payload.data.customer.email;
        if (!email) return;

        try {
            const clerk = await clerkClient();
            const users = await clerk.users.getUserList({ emailAddress: [email] });
            if (users.data.length > 0) {
                const user = users.data[0];
                await clerk.users.updateUserMetadata(user.id, {
                    publicMetadata: {
                        isPro: false,
                        polarSubscriptionId: null,
                    },
                });
            }
        } catch (error) {
            console.error("Failed to revoke subscription for", email, error);
        }
    },
});
