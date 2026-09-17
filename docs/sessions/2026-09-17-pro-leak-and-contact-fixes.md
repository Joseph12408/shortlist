# 2026-09-17 — Pro entitlement leak + contact/dashboard fixes

## What we set out to do
Joseph watched a **free user run full AI analysis + optimization** with the
"Pro activated" badge showing. Free users are getting paid features — costly and
urgent. Plus three smaller issues: no footer on the dashboard, the contact
notification email arrived without the form fields, and the contact success
message wording.

## Bug: free users granted Pro (root cause)
Two things write `isPro: true` into a user's Clerk `publicMetadata`:
1. The Whop webhook on `membership.activated` — legitimate, signature-verified.
2. The **self-heal** in `getEntitlementWithSync()` (`lib/subscription-server.ts`),
   reached via `/api/subscription/check`, which the client calls for **every
   non-Pro user on load**.

The self-heal fetched `GET https://api.whop.com/v2/memberships?email=X` and
marked the user Pro if it found *any* item looking active
(`m.valid === true || status in [...]`). It **never verified the returned
membership actually belonged to the caller's email.** If Whop's `?email=` filter
isn't enforced server-side (returns the company's memberships), the first active
membership anywhere flips *every* free user to Pro — and self-heal then writes
`isPro: true` into their Clerk metadata **permanently**, so the fast-path
`getEntitlement()` keeps serving them paid work.

The server routes themselves gate correctly (`getEntitlement()` → 402 for
non-Pro); the leak is entirely that metadata was being falsely set.

### Fix
Require the returned membership to belong to the caller: match
`(m.email || m.user?.email)` against the session email (case-insensitive) before
counting it active. Also dropped the ambiguous `"completed"` status. If Whop
membership objects carry no email, nothing matches and self-heal simply no-ops —
the safe direction, since the webhook remains the primary activation path.

### Still needs remediation (NOT yet done)
Users already wrongly flipped keep `isPro: true` in Clerk metadata; the code fix
only stops *new* leaks. Self-healed users are identifiable by
`publicMetadata.selfHealedAt` being set (legit ones have `proPlanActivatedAt`
from the webhook, or are the lifetime email). Proposed: a one-off script to reset
`isPro` for users with `selfHealedAt` and no active Whop membership.

**Decision (2026-09-17): Joseph chose to leave already-affected accounts as-is
for now** — only stop new leaks, assess scale later. Revisit if the free-Pro
population turns out to be non-trivial. The `selfHealedAt` vs `proPlanActivatedAt`
discriminator still holds whenever we come back to it.

## Other fixes
- **Footer on dashboard**: there was no `app/dashboard/layout.tsx` and no
  dashboard page rendered `<Footer/>`. Added a dashboard layout that appends it.
- **Contact success wording**: "usually within a couple of days" → "as soon as
  we can".
- **Contact email missing form fields**: could not find any code path that emails
  a resume or drops the form fields — the notification template includes name,
  email, category, and message. Asked Joseph for the received email's subject/
  sender to diagnose. OPEN.

## Follow-up (later 2026-09-17)

### Deploy verified
Confirmed via Vercel API: production deployment for commit `ecd5e7f` (the Pro
fix) and `6e06bf2` are both `READY`/production. The fix IS live. Joseph's "nothing
changed" is expected — see below.

### Why the leak looked unfixed
The code fix only stops *new* self-heal grants. Accounts already stamped
`isPro:true` in Clerk metadata keep it (fast path never re-checks). Joseph had
deferred cleanup, so the account he was testing still showed Pro. He then asked
to build the cleanup after all.

### Cleanup script — `scripts/reconcile-pro.ts`
Dry-run by default (`--apply` to write). Scans Clerk users marked Pro,
re-verifies each against Whop (email-matched), and resets only self-healed
(`selfHealedAt`, no `proPlanActivatedAt`) accounts with no active membership.
Lifetime account always skipped; Whop-unreachable users left alone.

**Dry-run finding (against the local TEST Clerk instance, `sk_test_`):** 8 users,
3 Pro, 1 lifetime skipped, 1 confirmed active, 0 self-heal victims, and 1 flagged
for review: `nkemvoudaniel@gmail.com` — Pro via **webhook** (`proPlanActivatedAt`)
but **no active Whop membership**. That's a *second* leak type: a lapsed
membership whose cancel webhook never removed Pro. Script left it untouched
(conservative). RESOLVED: Joseph confirmed `nkemvoudaniel@gmail.com` is a test
account he made Pro intentionally — not a leak. The script's default (never
auto-reset webhook-activated accounts) is correct; leave that account as-is.

**Important:** the real users are in the PRODUCTION (`sk_live_`) Clerk instance.
To clean prod, run the script with the production `CLERK_SECRET_KEY` and
`WHOP_API_KEY` (from Vercel), not the local test keys. `envVar()` prefers
`process.env`, so inline env vars override `.env.local`.

### Contact email mystery — resolved
Prod `contactMessages` table is EMPTY (checked via `convex data --prod`): no one
has ever successfully submitted the form. Joseph determined the resume email he
got was a Google Drive share sent to him, unrelated to the app. Dropped.
Note: the contact form has therefore not been exercised by a real user in prod yet.

### Privacy policy rewrite
`app/privacy/page.tsx` rewritten from a 6-section stub into a full policy
reflecting the actual stack (Clerk, Convex, Vercel, Gemini/OpenAI, Whop, Resend,
Arcjet, Sentry, PostHog), with AI-processing, retention, cookies, rights,
children, international-transfer, and contact sections. Contact points to the
working `/contact` page. NOT legal advice — Joseph should have it reviewed.

## Full free/Pro gating audit (2026-09-17, requested by Joseph)
Joseph reported free users generating optimized resumes and believed the gating
had regressed. Audited every optimize path:

- **`ai-toolbar.tsx`**: free users get an amber Crown "Generate" button that goes
  straight to `/pricing`; it never calls optimize. (Correct.)
- **`builder/page.tsx` `handleOptimize`**: `if (!isPro) router.push('/pricing')`.
  (Correct.)
- **`/api/generate`**: returns 402 `pro_required` when `!isPro`. (Correct.)
- Entry flows — upload (`/api/parse`, free), build-from-scratch, and analysis
  (`analysis/page.tsx` handleOptimize only *navigates* to `/builder`) — all funnel
  into the gated Generate button. No ungated optimize path exists.
- Grep for hardcoded bypass / `isPro = true`: only legitimate sites (lifetime
  email, Whop-verified, webhook). No bypass.

**Verdict: the gating code is correct and defense-in-depth. It did NOT regress.**
The only way a "free" user optimizes is if their Clerk `publicMetadata.isPro` is
`true` — i.e., their account was stamped by the old self-heal bug. Every gate
reads that flag, so a stamped account is treated as Pro everywhere. This is a
DATA problem (poisoned accounts), fixed by running `reconcile-pro.ts` against
production, not a code problem.

Free tier = manual build, ATS score (top-3 issues), job scan (5/mo), standard
templates (standard/classic/minimal), watermarked PDF (3/mo). Pro = AI
optimization, AI cover letter, detailed ATS feedback, premium templates, clean
uncapped PDF, DOCX, unlimited saves. (Source: `lib/tiers.ts`,
`hooks/use-feature-access.ts`.)

### Added: targeted reset to reconcile-pro.ts
`--email <addr>` mode resets exactly one account's isPro flag (dry-run without
--apply). Lets Joseph instantly de-Pro a test account and confirm the free gate
works, turning "trust the code" into a live demonstration. Lifetime account
still protected.

## Decisions
- Entitlement fix errs strict: better to under-grant via the self-heal fallback
  (webhook still covers real activations) than ever over-grant.
- Cleanup script is dry-run-first and only auto-resets clear self-heal victims;
  webhook-activated-but-lapsed accounts are reported, not auto-nuked.
- The free/Pro gating code is correct as of this audit; do NOT rewrite it chasing
  this symptom. The fix is the production data cleanup.
