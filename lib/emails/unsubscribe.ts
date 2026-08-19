import crypto from "crypto";
import { SITE_URL } from "@/lib/resend";

/**
 * Stateless unsubscribe links.
 *
 * The address is signed with an HMAC so the link cannot be forged to opt out
 * someone else, and no token has to be stored to make it work. Falls back to
 * CLERK_SECRET_KEY only so local development works without extra setup; set
 * EMAIL_UNSUBSCRIBE_SECRET in production.
 */
function secret(): string {
    const s = process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.CLERK_SECRET_KEY;
    if (!s) throw new Error("No secret available for unsubscribe signing");
    return s;
}

export function signEmail(email: string): string {
    return crypto
        .createHmac("sha256", secret())
        .update(email.trim().toLowerCase(), "utf8")
        .digest("hex")
        .slice(0, 32);
}

export function verifyEmailToken(email: string, token: string): boolean {
    const expected = Buffer.from(signEmail(email), "utf8");
    const provided = Buffer.from(token, "utf8");
    if (expected.length !== provided.length) return false;
    return crypto.timingSafeEqual(expected, provided);
}

/** Absolute unsubscribe URL for a recipient. */
export function unsubscribeUrl(email: string): string {
    const params = new URLSearchParams({
        e: email.trim().toLowerCase(),
        t: signEmail(email),
    });
    return `${SITE_URL}/unsubscribe?${params.toString()}`;
}
