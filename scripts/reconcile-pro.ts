/**
 * One-off remediation: reclaim Pro from accounts wrongly upgraded by the old
 * self-heal bug.
 *
 * Background: getEntitlementWithSync() used to mark a user Pro on ANY
 * active-looking Whop membership in the API response, without checking it
 * belonged to that user, and then wrote `isPro: true` into their Clerk
 * publicMetadata (tagged with `selfHealedAt`). That handed Pro to free users.
 * The code bug is fixed; this script cleans up the accounts it already stamped.
 *
 * What it does: for every Clerk user currently marked Pro, re-verify against
 * Whop using the corrected email-matched logic. Reset `isPro: false` only for
 * accounts that (a) are not the lifetime developer account, (b) got Pro from
 * the self-heal (`selfHealedAt` set) rather than the webhook, and (c) have no
 * active Whop membership. Anything ambiguous is reported, never touched.
 *
 * SAFETY:
 *   - Dry run by default: prints what it WOULD do and writes nothing.
 *   - Pass --apply to actually perform the resets.
 *   - If Whop can't be reached for a user, that user is left unchanged.
 *
 * Run:
 *   npx tsx scripts/reconcile-pro.ts                       # report only (safe)
 *   npx tsx scripts/reconcile-pro.ts --apply               # perform the resets
 *   npx tsx scripts/reconcile-pro.ts --email a@b.com          # preview one account
 *   npx tsx scripts/reconcile-pro.ts --email a@b.com --apply  # de-Pro one account
 *
 * Reads CLERK_SECRET_KEY and WHOP_API_KEY from the environment, falling back to
 * .env.local so it works the same way the other scripts here do. Point it at
 * the deployment you want to clean: the keys in .env.local are for the
 * environment those keys belong to.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { createClerkClient } from "@clerk/backend";
import { findActiveMembership } from "../lib/whop-membership";

function envVar(name: string): string | undefined {
    if (process.env[name]) return process.env[name];
    try {
        const text = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
        const line = text.split(/\r?\n/).find((l) => l.startsWith(name + "="));
        return line ? line.slice(name.length + 1).trim() : undefined;
    } catch {
        return undefined;
    }
}

const CLERK_SECRET_KEY = envVar("CLERK_SECRET_KEY");
const WHOP_API_KEY = envVar("WHOP_API_KEY");
const LIFETIME_PRO_EMAIL = "josephnjuma793@gmail.com";
const APPLY = process.argv.includes("--apply");

/**
 * Optional targeted mode: `--email someone@example.com` resets exactly that one
 * account's Pro flag, no Whop check. Use it to instantly de-Pro a test account
 * and confirm the free-tier gating works. The lifetime account is still
 * protected so you can't accidentally lock yourself out.
 */
const emailIdx = process.argv.indexOf("--email");
const TARGET_EMAIL =
    emailIdx !== -1 ? (process.argv[emailIdx + 1] || "").toLowerCase() : null;

if (!CLERK_SECRET_KEY) {
    console.error("Missing CLERK_SECRET_KEY (checked env and .env.local). Aborting.");
    process.exit(1);
}

const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

/**
 * Is this email an active Whop member? Mirrors the fixed logic in
 * lib/subscription-server.ts: a membership only counts if it demonstrably
 * belongs to this email. Returns null when Whop can't be reached, so the caller
 * can leave the account alone rather than guess.
 */
async function isActiveOnWhop(email: string): Promise<boolean | null> {
    if (!WHOP_API_KEY) return null;
    try {
        const res = await fetch(
            `https://api.whop.com/v2/memberships?email=${encodeURIComponent(email)}`,
            { headers: { Authorization: `Bearer ${WHOP_API_KEY}` } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        // Same email-matched logic as the app, so the script and the request
        // path can never disagree about who is actually a member.
        return findActiveMembership(data, email) !== null;
    } catch {
        return null;
    }
}

async function resetOneAccount(targetEmail: string) {
    console.log(`\nReconcile Pro — targeted ${APPLY ? "APPLY" : "DRY RUN"} for ${targetEmail}\n`);

    if (targetEmail === LIFETIME_PRO_EMAIL) {
        console.log("  Refusing to reset the lifetime developer account.");
        return;
    }

    const { data } = await clerk.users.getUserList({ emailAddress: [targetEmail] });
    if (data.length === 0) {
        console.log(`  No Clerk user found for ${targetEmail}.`);
        return;
    }

    for (const u of data) {
        const meta = (u.publicMetadata || {}) as Record<string, unknown>;
        const isPro = meta.isPro === true || meta.isPro === "true";
        console.log(`  ${u.id} — currently isPro=${isPro}`);
        if (!APPLY) {
            console.log(`  Would set isPro=false. Re-run with --apply to write.`);
            continue;
        }
        await clerk.users.updateUserMetadata(u.id, {
            publicMetadata: {
                ...meta,
                isPro: false,
                proReclaimedAt: new Date().toISOString(),
                proReclaimedReason: "manual targeted reset",
            },
        });
        console.log(`  Reset isPro=false for ${targetEmail}.`);
    }
}

async function main() {
    if (TARGET_EMAIL) {
        await resetOneAccount(TARGET_EMAIL);
        return;
    }

    console.log(`\nReconcile Pro — ${APPLY ? "APPLY (writes enabled)" : "DRY RUN (no writes)"}\n`);

    const limit = 100;
    let offset = 0;
    let scanned = 0,
        proCount = 0,
        reset = 0,
        keptActive = 0,
        review = 0,
        skippedLifetime = 0;

    for (;;) {
        const page = await clerk.users.getUserList({ limit, offset });
        const users = page.data;
        if (users.length === 0) break;

        for (const u of users) {
            scanned++;
            const meta = (u.publicMetadata || {}) as Record<string, unknown>;
            const isPro = meta.isPro === true || meta.isPro === "true";
            if (!isPro) continue;
            proCount++;

            const email =
                u.primaryEmailAddress?.emailAddress ??
                u.emailAddresses?.[0]?.emailAddress ??
                "";

            if (email.toLowerCase() === LIFETIME_PRO_EMAIL) {
                skippedLifetime++;
                continue;
            }

            const active = await isActiveOnWhop(email);
            if (active === true) {
                keptActive++;
                continue;
            }
            if (active === null) {
                console.log(`  ? REVIEW  ${email} — Whop unreachable, left unchanged`);
                review++;
                continue;
            }

            const selfHealed = !!meta.selfHealedAt;
            const webhookActivated = !!meta.proPlanActivatedAt;

            if (selfHealed && !webhookActivated) {
                console.log(`  x RESET   ${email} — self-healed, no active Whop membership`);
                reset++;
                if (APPLY) {
                    await clerk.users.updateUserMetadata(u.id, {
                        publicMetadata: {
                            ...meta,
                            isPro: false,
                            proReclaimedAt: new Date().toISOString(),
                            proReclaimedReason: "self-heal bug; no active membership",
                        },
                    });
                }
            } else {
                console.log(
                    `  ? REVIEW  ${email} — Pro but not active on Whop ` +
                        `(selfHealed=${selfHealed}, webhookActivated=${webhookActivated}); left unchanged`
                );
                review++;
            }
        }

        offset += users.length;
        if (users.length < limit) break;
    }

    console.log(
        `\nScanned ${scanned} users. Marked Pro: ${proCount} ` +
            `(lifetime account skipped: ${skippedLifetime}).`
    );
    console.log(
        `Confirmed active: ${keptActive}. ` +
            `${APPLY ? "Reset" : "Would reset"}: ${reset}. Flagged for review: ${review}.`
    );
    if (!APPLY && reset > 0) {
        console.log(`\nRe-run with --apply to perform the ${reset} reset(s).`);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
