import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import { EmailStep, Recipient, SEQUENCE } from "./sequence";
import { unsubscribeUrl } from "./unsubscribe";

/**
 * Send or schedule one sequence step.
 *
 * Never throws. Email is a side effect of signup, and a Resend outage must not
 * fail the webhook, because Clerk would retry it and the user could end up
 * with duplicates. Returns the Resend id on success so scheduled sends can be
 * cancelled later if the recipient opts out.
 */
export async function sendStep(
    step: EmailStep,
    recipient: Recipient,
    sendAt?: Date
): Promise<string | null> {
    const resend = getResend();

    if (!resend) {
        console.warn(`[EMAIL] RESEND_API_KEY not set, skipping "${step.id}" to ${recipient.email}`);
        return null;
    }

    if (step.kind === "marketing" && !recipient.unsubscribeUrl) {
        console.error(`[EMAIL] Refusing to send marketing step "${step.id}" without an unsubscribe URL`);
        return null;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: recipient.email,
            replyTo: REPLY_TO,
            subject: step.subject(recipient),
            html: step.html(recipient),
            // Resend takes ISO 8601 and handles delivery timing itself.
            ...(sendAt ? { scheduledAt: sendAt.toISOString() } : {}),
            ...(recipient.unsubscribeUrl
                ? {
                      headers: {
                          // Lets Gmail and Apple Mail show a native unsubscribe
                          // control, which measurably reduces spam complaints.
                          "List-Unsubscribe": `<${recipient.unsubscribeUrl}>`,
                          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                      },
                  }
                : {}),
        });

        if (error) {
            console.error(`[EMAIL] Resend rejected "${step.id}" for ${recipient.email}:`, error);
            return null;
        }

        console.log(
            `[EMAIL] ${sendAt ? `Scheduled "${step.id}" for ${sendAt.toISOString()}` : `Sent "${step.id}"`} to ${recipient.email} (id: ${data?.id})`
        );
        return data?.id ?? null;
    } catch (err) {
        console.error(`[EMAIL] Failed sending "${step.id}" to ${recipient.email}:`, err);
        return null;
    }
}

/**
 * Queue the whole onboarding sequence for a new signup.
 *
 * Step 1 goes out now; later steps are scheduled with Resend. Returns the ids
 * of the scheduled (not yet delivered) messages so they can be cancelled if
 * the recipient unsubscribes before they land.
 */
export async function startOnboardingSequence(recipient: {
    email: string;
    firstName?: string | null;
}): Promise<string[]> {
    const withUnsubscribe: Recipient = {
        ...recipient,
        unsubscribeUrl: unsubscribeUrl(recipient.email),
    };

    const now = Date.now();
    const scheduledIds: string[] = [];

    for (const step of SEQUENCE) {
        const sendAt =
            step.delayDays > 0
                ? new Date(now + step.delayDays * 24 * 60 * 60 * 1000)
                : undefined;

        const id = await sendStep(step, withUnsubscribe, sendAt);

        // Only future sends are cancellable.
        if (id && sendAt) scheduledIds.push(id);
    }

    return scheduledIds;
}

/** Cancel still-queued messages, used when someone unsubscribes mid-sequence. */
export async function cancelScheduled(emailIds: string[]): Promise<number> {
    const resend = getResend();
    if (!resend || emailIds.length === 0) return 0;

    let cancelled = 0;
    for (const id of emailIds) {
        try {
            await resend.emails.cancel(id);
            cancelled++;
        } catch (err) {
            // Already delivered or already cancelled. Not an error worth failing on.
            console.warn(`[EMAIL] Could not cancel ${id}:`, err);
        }
    }
    return cancelled;
}
