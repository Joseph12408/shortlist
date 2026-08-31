# 2026-08-31 Cross-device sync and dashboard grading

## What we set out to do

Joseph signed into Shortlist from a second device and found an empty account:
no resumes, no cover letters, no reviews, grading bars at zero. The previous
session had traced an outage to `NEXT_PUBLIC_CONVEX_URL` pointing at the dev
deployment, fixed it, and confirmed rows were landing in production again. That
fix was real but it was not the whole story, and the account still did not
follow him between devices.

Two separate complaints, and they turned out to have separate causes:

1. Saved work does not appear when signing in elsewhere.
2. The AI Grading System bars on the dashboard sit at zero.

## Bugs found and why they happened

### The account was never loaded outside the builder

`useResumeStore.initialize()` is the only thing that reads resumes and cover
letters from Convex. It was called from exactly one place: the
`useResumePersistence` hook, which is used by exactly one page,
`app/(app)/builder/page.tsx`.

The dashboard, My Resumes and Cover Letters all read `savedResumes` and
`savedCoverLetters` straight from the Zustand store, whose `persist` middleware
mirrors both into localStorage. On the machine where the work was created, that
mirror was populated, so every screen looked correct. On a second device the
mirror was empty and nothing ever asked the server, so the account rendered as
brand new.

This is why the previous session's env-var fix looked insufficient. Writes were
reaching Convex; reads were never being issued.

### Loaded resumes had no id

`initialize()` assigned the Convex documents straight to state:

    const loadedResumes = resumes as unknown as Resume[];

Convex returns `_id`. The rest of the app keys off `id`. Cover letters were
mapped correctly (`id: cl._id`); resumes were not. Every resume loaded from the
server therefore carried `id: undefined`, which meant:

- `isDraftId(undefined)` returned true, so the next autosave inserted a
  duplicate instead of patching the existing row.
- `handleEdit(r.id)` produced `/builder?mode=edit&resumeId=undefined`.
- `deleteResume` and `renameResume` silently skipped their Convex calls.

### Local-only records were stranded, then discarded

Anything created while the backend was unreachable kept a client-side UUID.
`initialize()` never uploaded those, and when Convex did return rows it
overwrote `savedResumes` wholesale, so the local-only copies were dropped
without ever having been persisted anywhere.

### Old localStorage records could not be written even when a write was attempted

`saveCurrentResume` passed the store object straight into the Convex mutation.
Records restored from older builds can be missing fields the validator requires
(no `leadership` array, no `website` string). One missing field rejects the
entire write, which is another way work stayed pinned to one machine.

### Grading bars depended on a table almost nothing writes

The four dashboard bars read only from the `analyses` table, which is written
exclusively by a completed run on `/analysis`. Building a resume in the builder
writes `resumes` and `jobScans`, never `analyses`. So the normal path through
the app left all four bars at zero, with no way for the user to tell whether
that meant "scored zero" or "never measured".

The version before commit 21c5ad4 appeared to work because it fell back to
hardcoded numbers (90/85/92/84) and three fake reviews. Those were removed
deliberately and are staying removed. The bars now compute from real data
instead.

### Signing out left the previous user's data on screen

`savedResumes` is persisted to localStorage and was never cleared on sign-out.
On a shared machine the next person would have seen the previous user's resumes,
and any unsynced draft would have been uploaded into the wrong account by the
migration added this session.

## What changed

**Hydration is now app-wide.** New `StoreSyncProvider`, mounted in the root
layout inside `ConvexClientProvider`. It watches `useConvexAuth()` and calls
`initialize()` once Clerk has actually issued a token. Waiting for the token
matters: the Convex queries treat "no identity" as "no rows", so firing early
returns an empty list and the app concludes the account is empty. On sign-out it
calls the new `clearLocalData()`.

The builder's persistence hook no longer calls `initialize()` itself; it only
handles the debounced autosave.

**`initialize()` rewritten** to map `_id` to `id`, treat Convex as authoritative
once it answers, guard against concurrent calls with `isSyncing`, and report a
load failure rather than silently falling back to the local mirror.

**New `migrateLocalOnly()`** uploads any non-empty record still carrying a draft
id, re-points the local copy at the returned server id so the next autosave
patches rather than duplicates, and tells the user how many items were synced.

**New `toResumePayload` / `toCoverLetterPayload`** in `lib/resume-utils.ts`
coerce every field the Convex validator requires. `customStyles` is dropped
entirely when incomplete, since the validator wants all four base fields or
nothing. Used by both the migration and `saveCurrentResume`.

**Dashboard grading** reads a saved review when one exists, because that is the
exact snapshot the user saw. Otherwise it scores the most recent resume live
with `analyzeResume`, the same scorer the Analysis page uses. The panel subtitle
now names what is being measured. `Avg. AI Rating` falls back the same way.
Nothing is invented: with no resumes at all it still reads zero.

**Builder deep-link race** fixed. `/builder?mode=edit&resumeId=X` could land
before hydration finished, find nothing in an empty list, and open a blank
editor that looked exactly like a lost resume. The id is now resolved again once
`initialLoadDone` flips.

## Verification

- `npx tsc --noEmit`: no errors in any touched file. The ~36 pre-existing errors
  elsewhere are unchanged and still suppressed by `ignoreBuildErrors`.
- `npm test`: 8 suites pass, including a new `sync-payload` suite covering the
  normalizer against a deliberately incomplete legacy record.
- `npm run build`: compiles clean.
- Production Convex data inspected directly: the one existing resume row has
  `_id` and no `id`, confirming the mapping bug was live.

Not verified by me: the signed-in cross-device path, which needs Joseph's
credentials. That is his test.

## Still open

- Joseph to confirm on a second device that resumes now appear after sign-in.
- `analyses` stays empty until a run completes on `/analysis`. The grading bars
  no longer depend on it, but Recent Reviews still does, correctly.
- Mobile phases 3 and 4 (44px tap targets globally, preview zoom, upload copy,
  `prefers-reduced-motion`, keyboard focus).
- DMARC TXT record at Namecheap.
- Namecheap email forwarding for support@shortlist.ink.
- `EMAIL_UNSUBSCRIBE_SECRET` in Vercel.
- Free tier has never actually been exercised: the lifetime-Pro bypass on
  Joseph's email means watermarks and the scan/export caps are untested. Needs a
  second email address.

## Decisions that should not be quietly reversed

- No placeholder or demo data on the dashboard. If a number cannot be derived
  from the user's real data it shows zero and says why. The pre-21c5ad4
  hardcoded scores and fake reviews are not coming back.
- Convex is the source of truth. localStorage is a paint-fast mirror, never a
  silent fallback that lets an outage look like success.
- Sync failures are surfaced to the user, once per session.

## Follow-up: the sign-out wipe

Joseph signed in on his phone, saw the sync notice and two resumes, then
reported that a resume created on a third device had still not appeared.

The database confirmed it: two rows, one being the phone's migrated draft
(created minutes after the deploy) and one the original. The third device's
resume is not on the server.

The cause is a bug in the first version of `StoreSyncProvider`. It cleared the
local mirror on sign-out:

    if (isAuthenticated) { initialize(); } else { clearLocalData(); }

`isAuthenticated` is false for every signed-out page view, not just the moment
somebody signs out. Opening the landing page while logged out took that branch.
Since the whole point of the migration is that unsynced records live only in
localStorage, this deleted exactly the data it was meant to protect, and it did
so before the record ever had a chance to be uploaded.

Reworked to check at sign-in instead: compare the Clerk user id against the
persisted `lastUserId` and clear only when a different account signs in on the
same machine. That keeps the shared-machine protection (the clear still happens
before hydration, so nobody inherits the previous user's list) without a
signed-out page view being destructive.

Also fixed: `toResumePayload` treated a placeholder title as a real one, because
"Untitled Resume" is truthy. The phone's migrated resume arrived on the server
called "Untitled Resume" for that reason. Placeholders are now replaced with a
derived title, and titles the user actually chose are left alone.
