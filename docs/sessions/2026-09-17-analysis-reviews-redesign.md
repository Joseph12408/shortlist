# 2026-09-17 — Redesign: AI Analysis + AI Reviews pages

## What we set out to do
Joseph supplied a Google Stitch design ("Shortlist Precision") for the AI Resume
Analysis page and asked to:
1. Redesign `/analysis` to match it, but **without the Stitch left sidebar** — the
   app already has the global top header, and a sidebar would make it look like the
   dashboard's AI Reviews page.
2. Redesign the AI Reviews page (`/dashboard/reviews`) using the same resume-list
   card, which he wants on both pages.

## Design translation
Stitch tokens → the app's existing shadcn/Tailwind tokens (no second colour
system): surface→`bg-card`, 1px `border`, `text-foreground`/`text-muted-foreground`,
Action Blue → the app's `primary` (already indigo), Outfit via `font-heading`.
Accent stays disciplined to the blue primary; status colours (emerald/amber/red)
only on scores and badges.

## What changed
- **`components/analysis/resume-analysis-card.tsx`** (new): the shared resume-list
  card — icon + title + status badge + meta + optional insight box + score chip +
  actions. One component, used by both pages, so they feel like one product.
  Exports `scoreTone()` (score→colour) reused by the analysis KPI ring.
- **`app/analysis/page.tsx`** (rewritten hub): badge + Outfit H1 + subtitle, a
  Stitch-style drag/drop upload card, a 3-up KPI row (Overall Readiness with an
  SVG score ring, Saved Resumes, Best ATS Score) computed from real saved resumes
  via `analyzeResume`, and the list of saved resumes as cards. No sidebar — global
  header only. All existing upload→parse→analyze logic preserved; the results view
  still renders `AnalysisResults`.
  - "Optimize" per card is **Pro-gated** (`useFeatureAccess`): free users get a
    Crown and route to `/pricing`; server still enforces. Consistent with the
    entitlement work.
- **`app/dashboard/reviews/page.tsx`** (rewritten): same `ResumeAnalysisCard`, fed
  from `api.analyses.list` — score chip, status badge, date + "matched to a job",
  an insights line from `issueCounts`, "View full report" → `/dashboard/reviews/[id]`,
  and delete. Keeps the dashboard tab header.

## Verified
- `tsc --noEmit`: no type errors in the changed files.
- Rendered a temporary public preview route and screenshot it with the system
  Chrome (puppeteer-core) at 1280px and 390px. Desktop matches the Stitch layout;
  mobile stacks correctly (header→hamburger, KPI cards stack, card score/actions
  reflow below the title). Preview route + screenshot script deleted afterwards.

## Follow-up: report view redesign (second Stitch design)
Joseph supplied a second Stitch design — the detailed report/results view
("Report #REV-8849"). It shipped with many fabricated features (inline
Apply/Dismiss suggestions, "Apply All AI Edits", Export Report, Simulated
Recruiter Glance, three made-up metric cards). Joseph chose **"adapt & drop the
fakes"**.

Both the live results and the saved-review detail render one component
(`AnalysisResults`), so it was restyled once and both pages get the look:
- Header card (verified/date meta, Outfit title, Optimize + secondary actions).
- Circular overall score gauge + strengths/to-improve summary.
- Real "Score breakdown" of the 5 category scores.
- "Ready to lift your score?" optimize banner (real onOptimize → builder).
- Missing-keyword chips.
- Pro: the "5-pillar comprehensive audit" = the 5 real categories, each a card
  with score, status badge, and its findings + "how to fix it" solutions.
- Free: top-3 issues + the existing Pro upsell. Gating unchanged.
- Dropped every fabricated feature — no dead buttons.
- `app/dashboard/reviews/[id]/page.tsx` chrome simplified (bg-background, slim
  back link) since the component now renders its own header.

Verified via a throwaway client preview route: desktop + mobile screenshots of
the report (free view, which shares all the new primitives). Preview + script
deleted. tsc clean on the changed files.

## Notes / still open
- The analysis "results" view still uses the existing `AnalysisResults` component
  (unchanged) — only the hub was redesigned. Could be restyled to match later if
  Joseph wants.
- Per-resume scores are computed client-side with `analyzeResume` on render
  (memoised); fine at free-tier resume counts.
