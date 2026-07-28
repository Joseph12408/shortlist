import crypto from "crypto";

/** Reject replayed events older than this (5 minutes). */
export const MAX_SIGNATURE_AGE_SECONDS = 5 * 60;

/**
 * Verify the HMAC-SHA256 signature Whop sends alongside every webhook.
 *
 * Whop signs `${timestamp}.${rawBody}` and sends the result in a header shaped
 * like `t=1700000000,v1=<hex>`. Older/simpler setups send a bare hex digest of
 * the raw body, so both forms are accepted.
 *
 * Without this check the endpoint is an open door: anyone who knows the URL
 * could POST a `membership.activated` event and grant themselves Pro.
 */
export function verifyWhopSignature(
    rawBody: string,
    header: string | null,
    secret: string
): boolean {
    if (!header) return false;

    let timestamp: string | null = null;
    let provided: string | null = null;

    for (const part of header.split(",")) {
        // Split on the FIRST '=' only. The value itself may contain '='
        // (a `sha256=` prefix, or base64 padding), and a limited split would
        // silently truncate it.
        const trimmed = part.trim();
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;

        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim();

        if (key === "t") timestamp = value;
        else if (key === "v1" || key === "v0") provided = value;
    }

    // Bare-digest form (no key=value structure at all).
    if (!provided && !header.includes("=")) {
        provided = header.trim();
    }

    if (!provided) return false;

    // Reject stale signatures to blunt replay attacks.
    if (timestamp) {
        const sentAt = Number(timestamp);
        if (!Number.isFinite(sentAt)) return false;
        const ageSeconds = Math.abs(Date.now() / 1000 - sentAt);
        if (ageSeconds > MAX_SIGNATURE_AGE_SECONDS) return false;
    }

    const signedPayload = timestamp ? `${timestamp}.${rawBody}` : rawBody;
    const expected = crypto
        .createHmac("sha256", secret)
        .update(signedPayload, "utf8")
        .digest("hex");

    // Normalise a possible `sha256=` prefix before comparing.
    const normalised = provided.replace(/^sha256=/i, "").toLowerCase();

    const expectedBuf = Buffer.from(expected, "utf8");
    const providedBuf = Buffer.from(normalised, "utf8");

    // timingSafeEqual throws on length mismatch, so guard first.
    if (expectedBuf.length !== providedBuf.length) return false;

    return crypto.timingSafeEqual(expectedBuf, providedBuf);
}
