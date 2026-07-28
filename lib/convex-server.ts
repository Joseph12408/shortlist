import { ConvexHttpClient } from "convex/browser";
import { auth } from "@clerk/nextjs/server";

/**
 * Convex client for use inside API routes / server components.
 *
 * A fresh client is created per request and authenticated with the caller's
 * Clerk JWT, so Convex's `ctx.auth.getUserIdentity()` resolves to the real
 * user and the per-user authorization checks in the query/mutation handlers
 * apply exactly as they do from the browser.
 *
 * Fails closed to null on any error, including a missing or misconfigured
 * Clerk JWT template. Callers already treat null as "quota tracking
 * unavailable" and degrade accordingly; letting this throw would take down
 * the whole route for a feature that is only needed for free-tier limits.
 */
export async function getServerConvexClient(): Promise<ConvexHttpClient | null> {
    try {
        const { getToken } = await auth();
        const token = await getToken({ template: "convex" });
        if (!token) return null;

        const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
        client.setAuth(token);
        return client;
    } catch (error) {
        console.error("[CONVEX SERVER CLIENT] Failed to obtain Clerk token:", error);
        return null;
    }
}
