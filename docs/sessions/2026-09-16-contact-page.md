# 2026-09-16 — Contact page

## What we set out to do
Add a contact page so users can reach the team with questions, suggestions, or
problems. While the support inbox (`support@shortlist.ink`) is down, messages go
to Joseph's personal email. Deliver with the stack already in place — Resend for
email, Convex for storage — rather than a third-party form tool.

## Starting point
- Real app lives at `C:\Users\USER\Desktop\shortlist` (repo
  `github.com/Joseph12408/shortlist`, branch `main`). NOTE: `C:\Users\USER\shortlist`
  is a stale copy of the bare starter template — do not work there.
- Resend already wired: `lib/resend.ts`, `lib/emails/*` (shared `renderEmail`
  layout + `esc`), used by the Clerk webhook.
- Established pattern: data → Convex; email sending → Next.js API route
  (nodejs runtime) via `ConvexHttpClient` + `lib/resend`.

## What changed
### New contact flow
- `app/contact/page.tsx` — server component, sets metadata, renders the form +
  `Footer`. Mirrors the `privacy`/`terms` page chrome (`Header`/`Toaster` are
  global in `layout.tsx`).
- `components/contact/contact-form.tsx` — client form: name, email, category
  (question/suggestion/problem/other), message, plus an off-screen honeypot
  (`company`) field. Sending / success / error states; posts JSON to
  `/api/contact`.
- `app/api/contact/route.ts` — public POST receiver (not auth-gated; visitors
  may be logged out). IP-keyed Arcjet rate limit + bot detection, `safeParseBody`
  + `contactSchema`, honeypot check. Stores in Convex first, then emails the
  team via Resend with `replyTo` set to the sender so replies go straight back
  to them. Marks the stored row `emailed: true` on success.
- `convex/schema.ts` — new `contactMessages` table (name, email, category,
  message, `emailed`, optional `clerkId`, `handled`), indexed `by_handled`.
- `convex/contact.ts` — unauthenticated `submit` (defensive length caps) and
  `markEmailed` mutations.
- `lib/emails/contact.ts` — `contactNotificationEmail`, built on the shared
  email layout, escapes all user input and keeps message line breaks.
- `lib/validations.ts` — `contactSchema` (zod v4 syntax).
- `lib/arcjet.ts` — `contactLimiter` (IP-keyed, 5/hour, bot detection).
- `components/layout/footer.tsx` — replaced the dead `mailto:support@` link with
  a `/contact` link under Product.

### Config
- `.env.local` — added `CONTACT_TO=josephnjuma793@gmail.com`. The route reads
  `CONTACT_TO` and falls back to `REPLY_TO`, so the personal address stays out of
  the repo. **Must be added to Vercel env vars** for production to deliver there.

## Decisions that should not be quietly reversed
- Delivery is Resend + Convex (not Web3Forms). Store-before-send is deliberate:
  a Resend outage degrades to "stored but not notified" (rows with
  `emailed: false`), never a lost message.
- The contact Convex mutations are unauthenticated on purpose (form is open to
  logged-out visitors), matching the existing `emailContacts` pattern. Abuse is
  contained by Arcjet on the route + length caps in the mutation.
- Sender's address goes in `replyTo`, not the From — From must stay on the
  verified `shortlist.ink` domain or Resend rejects the send.

## Bugs found / wrong turns (and why)
- First audit was done against `C:\Users\USER\shortlist`, the stale starter copy
  — no git, no Resend. Cause: that path looked like the project but wasn't it.
  The real repo is on the Desktop. Recorded above so it isn't repeated.
- Project uses zod v4 but existing `validations.ts` is written in zod v3 style
  (`required_error`, etc.), so `tsc --noEmit` reports many pre-existing errors.
  `next.config.ts` has `typescript.ignoreBuildErrors: true`, so the build ships
  regardless. New `contactSchema` was written in v4 style and runtime-tested.
- Local Next dev only answers over IPv4: `curl localhost` (IPv6 `::1`) gets
  connection-refused; `curl -4 127.0.0.1` works. Not a bug, just a gotcha for
  future smoke tests.

## Verified
- `npx convex codegen` succeeded and pushed the new table + functions to the dev
  deployment.
- `contactSchema` runtime-tested: valid input passes; bad input returns correct
  per-field errors.
- `GET /contact` → 200 with all form fields rendered.
- `POST /api/contact` with a scripted request → 403 (Arcjet bot detection),
  proving the route loads and bot protection is active; no email/storage side
  effects.

## Still open
- **Real browser happy-path not yet tested** — Arcjet blocks scripted POSTs, and
  a genuine submit sends a real email. Joseph to submit once from the live/dev
  site and confirm it lands in his Gmail.
- **Set `CONTACT_TO` in Vercel** (and `RESEND_API_KEY` if not already there) so
  production delivers to the right inbox.
- Nothing committed/pushed yet — awaiting the go-ahead to commit on `main` (or a
  branch) so Vercel deploys.
