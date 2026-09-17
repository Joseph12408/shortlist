/**
 * One-off: send a sample contact-form notification through the real Resend path
 * the /api/contact route uses, so we can confirm delivery, formatting, and the
 * CONTACT_TO destination independently of the browser/Arcjet layer.
 *
 * Run:  npx tsx scripts/test-contact-email.ts
 *
 * Uses RESEND_API_KEY, RESEND_FROM/RESEND_REPLY_TO, and CONTACT_TO from
 * .env.local, i.e. the same values the app reads.
 */
import { readFileSync } from "fs";
import { join } from "path";

// Load .env.local into process.env BEFORE importing modules that read it at
// import time (lib/resend derives FROM_ADDRESS from the environment on load).
try {
    const env = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    for (const line of env.split(/\r?\n/)) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
} catch {
    // Fall back to whatever is already in the environment.
}

async function main() {
    const { getResend, FROM_ADDRESS, REPLY_TO } = await import("../lib/resend");
    const { contactNotificationEmail } = await import("../lib/emails/contact");

    const resend = getResend();
    if (!resend) {
        console.error("RESEND_API_KEY is not set — cannot send. Aborting.");
        process.exit(1);
    }

    const CONTACT_TO = process.env.CONTACT_TO || REPLY_TO;

    const { subject, html } = contactNotificationEmail({
        name: "Test Sender",
        email: "test.sender@example.com",
        category: "question",
        message:
            "This is a test of the Shortlist contact form delivery path.\n\nIf you are reading this in your inbox, Resend, the sender domain, and CONTACT_TO are all working.",
    });

    console.log(`Sending test notification:`);
    console.log(`  from:    ${FROM_ADDRESS}`);
    console.log(`  to:      ${CONTACT_TO}`);
    console.log(`  replyTo: test.sender@example.com`);
    console.log(`  subject: ${subject}\n`);

    const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: CONTACT_TO,
        replyTo: "test.sender@example.com",
        subject,
        html,
    });

    if (error) {
        console.error("Resend rejected the send:", error);
        process.exit(1);
    }
    console.log(`Sent. Resend id: ${data?.id}`);
    console.log("Check the inbox for the message above (and the spam folder).");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
