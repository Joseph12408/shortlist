import { Resend } from "resend";

/**
 * Resend client for transactional and lifecycle email.
 *
 * Constructed lazily so importing this module does not throw during build when
 * RESEND_API_KEY is absent. Callers must handle a null return, which is the
 * signal that email is not configured in this environment.
 */
let client: Resend | null = null;

export function getResend(): Resend | null {
    if (!process.env.RESEND_API_KEY) return null;
    if (!client) client = new Resend(process.env.RESEND_API_KEY);
    return client;
}

/**
 * Sender identity. Must be on a domain verified in Resend, otherwise sends are
 * rejected. Override per environment with RESEND_FROM.
 */
export const FROM_ADDRESS =
    process.env.RESEND_FROM || "Shortlist <hello@shortlist.ink>";

/** Where replies land. Keep this a real inbox someone reads. */
export const REPLY_TO =
    process.env.RESEND_REPLY_TO || "support@shortlist.ink";

/** Public site URL, used to build absolute links inside emails. */
export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.shortlist.ink";
