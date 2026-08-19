import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { startOnboardingSequence } from "@/lib/emails/send";

/**
 * Clerk webhook receiver.
 *
 * Drives the signup email sequence off `user.created`. Clerk signs every
 * request with Svix, so the signature is verified before the payload is
 * trusted. Without that, anyone could trigger arbitrary email to arbitrary
 * addresses from our verified domain and destroy the sending reputation.
 */
export const runtime = "nodejs";
// Queues four Resend calls, which can exceed the default 10s ceiling.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
    const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!secret) {
        console.error("[CLERK WEBHOOK] Missing CLERK_WEBHOOK_SIGNING_SECRET");
        return new NextResponse("Server misconfigured", { status: 500 });
    }

    // Svix signs the raw body, so it must be read as text before parsing.
    const body = await request.text();

    const svixHeaders = {
        "svix-id": request.headers.get("svix-id") ?? "",
        "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
        "svix-signature": request.headers.get("svix-signature") ?? "",
    };

    if (!svixHeaders["svix-id"] || !svixHeaders["svix-signature"]) {
        return new NextResponse("Missing signature headers", { status: 401 });
    }

    let event: any;
    try {
        event = new Webhook(secret).verify(body, svixHeaders);
    } catch (err) {
        console.error("[CLERK WEBHOOK] Signature verification failed:", err);
        return new NextResponse("Invalid signature", { status: 401 });
    }

    try {
        if (event.type === "user.created") {
            await handleUserCreated(event.data);
        }

        // Always 200 on a verified event we simply do not handle, otherwise
        // Clerk retries it indefinitely.
        return new NextResponse("OK", { status: 200 });
    } catch (err) {
        console.error("[CLERK WEBHOOK] Handler failed:", err);
        return new NextResponse("Webhook processing error", { status: 500 });
    }
}

async function handleUserCreated(user: any) {
    // Clerk users can hold several addresses; the primary one is the target.
    const primaryId = user?.primary_email_address_id;
    const addresses: any[] = user?.email_addresses ?? [];
    const primary = addresses.find((e) => e.id === primaryId) ?? addresses[0];

    const email: string | undefined = primary?.email_address;

    if (!email) {
        console.error("[CLERK WEBHOOK] user.created carried no email address, skipping onboarding");
        return;
    }

    // Respect a prior opt-out: someone can unsubscribe, delete their account,
    // then sign up again, and should not be re-enrolled silently.
    const convex = convexClient();
    if (convex) {
        try {
            const optedOut = await convex.query(api.emailContacts.isUnsubscribed, { email });
            if (optedOut) {
                console.log(`[CLERK WEBHOOK] ${email} previously unsubscribed, not enrolling`);
                return;
            }
        } catch (err) {
            // Non-fatal: better to send the welcome than to silently drop it.
            console.error("[CLERK WEBHOOK] Could not check suppression list:", err);
        }
    }

    const scheduledIds = await startOnboardingSequence({
        email,
        firstName: user?.first_name ?? null,
    });

    // Remember the queued ids so an unsubscribe can cancel them.
    if (convex && scheduledIds.length > 0) {
        try {
            await convex.mutation(api.emailContacts.recordPending, {
                email,
                emailIds: scheduledIds,
            });
        } catch (err) {
            console.error("[CLERK WEBHOOK] Could not record pending email ids:", err);
        }
    }
}

/**
 * Unauthenticated Convex client.
 *
 * This runs as the server reacting to a Clerk event, not as a signed-in user,
 * so there is no session token to attach. The emailContacts functions are
 * written to work without an identity for exactly this reason.
 */
function convexClient(): ConvexHttpClient | null {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) return null;
    try {
        return new ConvexHttpClient(url);
    } catch {
        return null;
    }
}
