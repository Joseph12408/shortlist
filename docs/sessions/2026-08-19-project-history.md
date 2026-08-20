# Shortlist — project history to date

**Reconstructed from git history on 19 Aug 2026**, not from a live session. It exists so the
next conversation starts with context instead of from nothing. Anything here that is wrong or
missing is because the commit log was the only source — correct it freely.

From the next session onward, each conversation gets its own dated log alongside this one.

---

## What Shortlist is

A Next.js app deployed on Vercel. From the dependency and commit trail:

| Concern | Choice |
| :--- | :--- |
| Framework | Next.js (App Router) |
| Auth | Clerk |
| Payments | Whop, with embedded checkout |
| Data | Supabase |
| Abuse protection | Arcjet rate limiting |
| Email | Resend |
| State | Zustand |
| Validation | Zod |
| PDF export | `@sparticuz/chromium` (serverless-compatible) |

Core features visible in the history: resume handling and analysis, cover letters, a
dashboard with live metrics, PDF export, and a Pro tier behind a paywall.

---

## The arc, by phase

**Feb 2026 — getting it deployed.** Nine commits in two days, almost all fighting the Vercel
build: syntax errors, an `.npmrc`, ignoring TS/ESLint during build, removing obsolete Supabase
auth routes, wrapping `useSearchParams` in Suspense.

**Feb–Apr 2026 — defensive rendering.** A run of crash fixes from undefined arrays: optional
chaining on length checks, array guards across dashboard pages, a CoverLettersPage build crash.
Suggests data arriving in shapes the UI did not expect.

**Apr 2026 — PDF export on serverless.** Strict server-side auth removed from the export path,
then `@sparticuz/chromium` adopted to make Chromium work inside Vercel's limits.

**May 2026 — payments, and a lot of iteration on checkout.** Whop integrated, then roughly ten
commits reshaping the checkout: embedded vs direct links, one column vs two, overlay scrolling,
background colour, removing an intermediate paywall menu. A webhook now auto-unlocks Pro via
Clerk metadata.

**13 May 2026 — a security pass.** Zod input validation added, Arcjet rate limiting re-enabled
on all API routes, auth added to download endpoints, and **a hardcoded API key removed**.

**May–Jun 2026 — dashboard and subscription correctness.** A Stitch-inspired dashboard backed
by a live Zustand store. Then a pro-subscription bypass fixed, and the lifetime bypass narrowed
back to the developer account only.

**Jul–Aug 2026 — hardening.** PRD compliance and paywall enforcement, dependency pruning,
verification scripts promoted into a real test suite, and production fixes for serverless
limits and rate limiting.

**19 Aug 2026 — most recent.** Signup email sequence via a Clerk webhook and Resend.

---

## Worth knowing before touching this

- **Checkout has been reworked many times.** Before changing it again, find out which
  behaviour was actually wanted; several commits reverse earlier ones.
- **Bypass logic is deliberate and narrow.** The lifetime bypass is developer-account only —
  it was widened once by accident and then restricted again.
- **The build ignores TypeScript and ESLint errors.** That was a deployment expedient. Worth
  knowing it is hiding real errors rather than assuming the code is clean.
- **A hardcoded API key was once committed** and later removed. Check whether that key was
  rotated, and whether it is still reachable in git history.

## Still open

Unknown from git alone. To be filled in from the next working session.
