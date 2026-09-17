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
`isPro` for users with `selfHealedAt` and no active Whop membership. Awaiting
Joseph's go-ahead.

## Other fixes
- **Footer on dashboard**: there was no `app/dashboard/layout.tsx` and no
  dashboard page rendered `<Footer/>`. Added a dashboard layout that appends it.
- **Contact success wording**: "usually within a couple of days" → "as soon as
  we can".
- **Contact email missing form fields**: could not find any code path that emails
  a resume or drops the form fields — the notification template includes name,
  email, category, and message. Asked Joseph for the received email's subject/
  sender to diagnose. OPEN.

## Decisions
- Entitlement fix errs strict: better to under-grant via the self-heal fallback
  (webhook still covers real activations) than ever over-grant.
