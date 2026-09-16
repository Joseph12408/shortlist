import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { contactLimiter } from "@/lib/arcjet";
import { contactSchema, safeParseBody } from "@/lib/validations";
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import { contactNotificationEmail } from "@/lib/emails/contact";

/**
 * Public contact-form receiver.
 *
 * Open to logged-out visitors, so it is not auth-gated. Instead it is protected
 * by an IP-keyed Arcjet bucket plus bot detection, and by a hidden honeypot
 * field. The message is stored in Convex first and only then emailed, so a
 * Resend outage degrades to "stored but not notified" rather than losing it.
 */
export const runtime = "nodejs";

// Where contact messages are delivered. Kept in an env var so the personal
// inbox used while the support address is down never lands in the repo. Falls
// back to the support address rather than hard-coding anyone's mail.
const CONTACT_TO = process.env.CONTACT_TO || REPLY_TO;

export async function POST(request: NextRequest) {
    // Rate limit + bot check by IP.
    const decision = await contactLimiter.protect(request, { requested: 1 });
    if (decision.isDenied()) {
        const status = decision.reason.isBot() ? 403 : 429;
        return NextResponse.json(
            { error: status === 403 ? "Forbidden" : "Too many messages, please try again later." },
            { status }
        );
    }

    // Reject oversized / malformed bodies before touching anything.
    const bodyResult = await safeParseBody(request);
    if ("error" in bodyResult) return bodyResult.error;

    const parsed = contactSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const { name, email, category, message, company } = parsed.data;

    // Honeypot: real users never see the "company" field, so a filled one is a
    // bot. Answer 200 so the bot has no signal that it was caught, but do
    // nothing.
    if (company && company.trim().length > 0) {
        return NextResponse.json({ ok: true });
    }

    // Best-effort: capture the Clerk id if the sender happens to be signed in.
    let clerkId: string | undefined;
    try {
        const { userId } = await auth();
        clerkId = userId ?? undefined;
    } catch {
        // Not signed in, or Clerk unavailable. The form works either way.
    }

    // Store first, so nothing is lost if the email send fails.
    const convex = convexClient();
    let messageId: Id<"contactMessages"> | null = null;
    if (convex) {
        try {
            messageId = await convex.mutation(api.contact.submit, {
                name,
                email,
                category,
                message,
                clerkId,
            });
        } catch (err) {
            console.error("[CONTACT] Failed to store message in Convex:", err);
        }
    }

    // If storage failed AND email is unavailable, there is nothing we can do.
    const resend = getResend();
    if (!messageId && !resend) {
        return NextResponse.json(
            { error: "Message could not be delivered. Please email us directly." },
            { status: 500 }
        );
    }

    // Send the notification email to the team.
    let emailed = false;
    if (resend) {
        try {
            const { subject, html } = contactNotificationEmail({ name, email, category, message });
            const { error } = await resend.emails.send({
                from: FROM_ADDRESS,
                to: CONTACT_TO,
                // Replies go straight to the person who wrote in.
                replyTo: email,
                subject,
                html,
            });
            if (error) {
                console.error("[CONTACT] Resend rejected the notification:", error);
            } else {
                emailed = true;
            }
        } catch (err) {
            console.error("[CONTACT] Failed to send notification email:", err);
        }
    } else {
        console.warn("[CONTACT] RESEND_API_KEY not set; message stored but not emailed");
    }

    // Record that the team was notified, so un-emailed rows stand out later.
    if (emailed && convex && messageId) {
        try {
            await convex.mutation(api.contact.markEmailed, { id: messageId });
        } catch (err) {
            console.error("[CONTACT] Could not mark message as emailed:", err);
        }
    }

    // Stored or emailed (or both) counts as received from the user's side.
    return NextResponse.json({ ok: true });
}

/**
 * Unauthenticated Convex client.
 *
 * Runs as the server on behalf of an anonymous visitor, so there is no session
 * token to attach. `convex/contact.ts` is written to work without an identity
 * for exactly this reason.
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
