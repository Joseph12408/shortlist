# 2026-09-18 — Stricter grader + stronger optimizer

## What we set out to do
Joseph asked whether the resume grader is good/strict enough, why "92 = ready"
was confusing, and to make both the grader and the optimizer much stronger.

## The core problem found
The old grader was a lenient heuristic AND had a structural bug: the Keywords
category (20 pts) was flat-capped at 10 with no job description, so the maximum
score without a JD was **90** — yet the "ready" bar is 92. Unreachable in the
main flow. It also rewarded mere presence of patterns (any digit counted as a
metric; one strong-verb bullet gave full marks; JSON string length as a length
proxy; only 4 weak phrases + 5 buzzwords checked).

Industry reference: Jobscan = JD-match only; Resume Worded / Rezi / Enhancv =
standalone strict quality score out of 100 with no JD needed. We adopted the
latter as the base and treat a JD as keyword *precision* inside one category.

## What changed
### `lib/ats/ats-score.ts` — rewritten, strict, reachable to 100
Five categories, same keys (so UI grouping + Convex schema still work), new
weights and much stricter checks. Every non-success finding still carries a
detail + solution (Pro tier contract).
- **Content & Impact (30):** quantified-bullet ratio (bare years excluded),
  strong-verb ratio across ALL bullets, role depth (3–5 bullets), third-person
  summary ≥120 chars.
- **Structure & Format (20):** essential sections, real visible-text volume
  (not JSON length), every role has bullets, education completeness.
- **Keywords & Skills (15):** with a JD → match precision; without → skills
  richness (10+ concrete skills in 2+ groups). This removes the 90 ceiling —
  100 is now reachable with no JD.
- **Writing Quality (20):** weak phrases, buzzwords, filler density, over-long
  bullets (>240 chars), repeated opening verbs. Only graded when there is
  writing to assess.
- **Application Ready (15):** contact, professional link, dates on every role,
  polish (no future dates / double spaces / lowercase standalone "i").

### `ai/system_design_prompt.txt` — optimizer upgraded to match
Added a "WHAT A TOP-SCORING RESUME LOOKS LIKE" section that states the rubric
targets explicitly (60%+ quantified, strong verb every bullet with variety, 3–5
bullets/role, ≤240-char bullets, zero weak/buzz/filler words, no first-person
pronouns, 120+ char third-person summary echoing the role, 10+ real skills in
2+ groups, polished dates). Truthfulness rules still win over score — never
invent metrics or skills.

### `tests/tiers.test.ts`
- Made the prioritize-ordering check a direct unit test (the stricter grader
  correctly gives an empty resume no success items).
- Added: "an excellent resume can exceed 90 without a job description" — guards
  the removed cap. Full fast suite (9 suites) green.

## Consequences to know
- Scores will DROP across the board vs the old grader — that's intended (it's
  stricter). A resume that scored ~90 before may now sit in the 70s–80s. 92+ now
  genuinely means an excellent, quantified, tight resume.
- Old saved reviews keep their old scores/weights (historical); new analyses use
  the new rubric.

## Still open / optional
- The analysis flow still doesn't collect a JD. Without one, Keywords is scored
  on skills richness (reachable to 100), but keyword *precision* for a specific
  posting needs a JD input in the analysis UI (the "Match Job Description" field
  from the first Stitch design). Worth adding next if Joseph wants per-job fit.
- True "read like a recruiter" = LLM grading. Deferred: analysis is a free,
  rate-limited feature; per-call AI cost + non-deterministic scores (a re-check
  giving a different number) argue for the deterministic strict heuristic for now.
