/* Strict, recruiter-informed resume grader. See docs/sessions for the rationale. */
import { extractKeywords } from "./keyword-extractor";
import { Resume } from "@/types/resume";

export interface ATSFeedback {
    category: 'Content' | 'Structure' | 'Keywords' | 'Writing' | 'Application';
    /** One-line verdict. Shown to every user, including free. */
    message: string;
    /** Why this matters. Pro-only detail half. */
    detail?: string;
    /** Concrete fix. Pro-only solution half. */
    solution?: string;
    type: 'success' | 'warning' | 'error';
    scoreImpact: number;
}

export interface CategoryScore {
    name: string;
    score: number;
    maxScore: number;
    feedback: ATSFeedback[];
}

export interface ATSAnalysisResult {
    overallScore: number;
    categoryScores: Record<string, CategoryScore>;
    feedback: ATSFeedback[];
    matchedKeywords: string[];
    missingKeywords: string[];
}

// ── Lexicons ────────────────────────────────────────────────────────────────

/** Strong past-tense openers. A bullet that starts here reads as ownership. */
const STRONG_VERBS = new Set([
    "led", "built", "designed", "developed", "delivered", "launched", "created",
    "implemented", "improved", "increased", "reduced", "cut", "grew", "drove",
    "managed", "owned", "shipped", "automated", "streamlined", "optimized",
    "negotiated", "rebuilt", "architected", "engineered", "spearheaded",
    "founded", "scaled", "accelerated", "generated", "saved", "won", "secured",
    "produced", "coordinated", "directed", "established", "executed", "initiated",
    "orchestrated", "overhauled", "pioneered", "resolved", "transformed",
    "boosted", "authored", "analyzed", "mentored", "trained", "conducted",
]);

/** Weak, ownership-diluting phrasing. */
const WEAK_PHRASES = [
    "responsible for", "helped", "assisted", "worked on", "tasked with",
    "duties included", "in charge of", "participated in", "involved in",
    "contributed to", "part of a team",
];

/** Unverifiable self-description. */
const BUZZWORDS = [
    "synergy", "passionate", "team player", "go-getter", "thought leader",
    "detail-oriented", "results-driven", "self-starter", "hardworking",
    "dynamic", "motivated", "hard worker", "think outside the box",
    "proven track record", "excellent communication",
];

/** Padding that rarely changes meaning. */
const FILLER = [
    "very", "really", "various", "successfully", "effectively", "significantly",
    "utilize", "utilized", "leverage", "leveraged", "in order to", "a number of",
];

const PRONOUNS = /\b(i|me|my|mine|myself)\b/i;

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Split a description into individual bullets. */
function toBullets(desc?: string): string[] {
    if (!desc) return [];
    return desc
        .split(/\r?\n|•|·/)
        .map((b) => b.replace(/^[\s\-*•·•.\d)]+/, "").trim())
        .filter((b) => b.length > 0);
}

/** A bullet counts as quantified if it carries a real figure — not a bare year. */
function isQuantified(bullet: string): boolean {
    const withoutYears = bullet.replace(/\b(19|20)\d{2}\b/g, " ");
    return /%|\$|\d/.test(withoutYears) || /\b(doubled|tripled|halved)\b/i.test(bullet);
}

/** Does the bullet open with a recognised strong verb? */
function startsStrong(bullet: string): boolean {
    const first = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    return !!first && STRONG_VERBS.has(first);
}

function countOccurrences(haystack: string, needles: string[]): string[] {
    return needles.filter((n) => haystack.includes(n));
}

// ── Grader ──────────────────────────────────────────────────────────────────

export function analyzeResume(resume: Resume, jobDescription: string): ATSAnalysisResult {
    const feedback: ATSFeedback[] = [];

    const profile = resume.profile || ({} as Resume["profile"]);
    const experience = resume.experience || [];
    const leadership = resume.leadership || [];
    const projects = resume.projects || [];
    const education = resume.education || [];
    const skills = resume.skills || [];

    // Roles that carry "work" bullets. Leadership reads like experience.
    const roles = [...experience, ...leadership];
    const allBullets = roles.flatMap((r) => toBullets(r.description));
    const projectBullets = projects.flatMap((p) => toBullets(p.description));
    const writingBullets = [...allBullets, ...projectBullets];

    const visibleText = [
        profile.summary || "",
        ...roles.map((r) => r.description || ""),
        ...projects.map((p) => p.description || ""),
        skills.flatMap((s) => s.skills || []).join(" "),
    ].join(" ").trim();

    const hasWork = allBullets.length > 0;

    let contentScore = 0;
    let structureScore = 0;
    let keywordScore = 0;
    let writingScore = 0;
    let applicationScore = 0;

    // ─── 1. CONTENT & IMPACT (30) ────────────────────────────────────────────
    // Quantification quality (12) + verb ownership (8) + depth (6) + summary (4)
    if (!hasWork) {
        feedback.push({
            category: "Content",
            message: "No described experience found — this caps your score hard.",
            detail: "The work section carries the most weight for both recruiters and ATS. With no described roles there is nothing to grade for impact, which is 30% of the score.",
            solution: "Add at least your two most recent roles (internships, freelance, and serious university/side projects count) and describe each with 3–5 result-oriented bullets.",
            type: "error",
            scoreImpact: 0,
        });
    } else {
        // Quantification — how many bullets carry a real figure.
        const quantified = allBullets.filter(isQuantified).length;
        const qRatio = quantified / allBullets.length;
        if (qRatio >= 0.6) {
            contentScore += 12;
            feedback.push({
                category: "Content",
                message: "Most bullets are quantified with real figures.",
                detail: `${quantified} of ${allBullets.length} bullets carry a number, percentage, or dollar figure. Metrics are what survive a 7-second scan and turn a claim into evidence.`,
                solution: "Keep the single most impressive number in your top role's first bullet, where the eye lands first.",
                type: "success",
                scoreImpact: 12,
            });
        } else if (qRatio >= 0.35) {
            contentScore += 7;
            feedback.push({
                category: "Content",
                message: "Too few bullets are quantified.",
                detail: `Only ${quantified} of ${allBullets.length} bullets contain a measurable result. Recruiters discount bullets without figures — they read as duties, not achievements. Strong resumes quantify 60%+ of bullets.`,
                solution: 'Rewrite unquantified bullets using "[action] [metric] by [amount] in [timeframe]", e.g. "Cut report prep from 6 hours to 45 minutes". No exact figure? An honest estimate ("~", "approx.") still beats none.',
                type: "warning",
                scoreImpact: 7,
            });
        } else {
            contentScore += 2;
            feedback.push({
                category: "Content",
                message: "Almost nothing is quantified — the biggest gap on this resume.",
                detail: `Only ${quantified} of ${allBullets.length} bullets carry a figure. Without numbers every candidate's bullets read the same, and yours cannot stand out.`,
                solution: "For each bullet ask: how many, how much, how often, how fast? Volume handled, money saved, time cut, people supported, % improved. Lead with the result.",
                type: "error",
                scoreImpact: 2,
            });
        }

        // Verb ownership — share of bullets that open with a strong verb.
        const strong = allBullets.filter(startsStrong).length;
        const vRatio = strong / allBullets.length;
        if (vRatio >= 0.8) {
            contentScore += 8;
            feedback.push({
                category: "Content",
                message: "Bullets consistently open with strong action verbs.",
                detail: `${strong} of ${allBullets.length} bullets start with an ownership verb. Leading with the verb puts the emphasis on what you did, not what you were assigned.`,
                solution: "Vary the verbs so none repeats more than twice — reusing 'Managed' flattens the impact.",
                type: "success",
                scoreImpact: 8,
            });
        } else if (vRatio >= 0.5) {
            contentScore += 4;
            feedback.push({
                category: "Content",
                message: "Only some bullets lead with a strong verb.",
                detail: `${strong} of ${allBullets.length} bullets open with an action verb. The rest start with a noun or a weak phrase, which reads as a job description.`,
                solution: "Rewrite each remaining bullet to open with a past-tense verb: Led, Built, Designed, Delivered, Launched, Reduced, Automated, Negotiated.",
                type: "warning",
                scoreImpact: 4,
            });
        } else {
            feedback.push({
                category: "Content",
                message: "Most bullets do not start with an action verb.",
                detail: `Only ${strong} of ${allBullets.length} bullets open with a recognised verb. Bullets starting with 'Responsible for' or a noun describe a role rather than your contribution.`,
                solution: '"Responsible for the weekly report" → "Produced the weekly revenue report for a 30-person sales team." Openers: Led, Built, Designed, Delivered, Launched, Reduced.',
                type: "error",
                scoreImpact: 0,
            });
        }

        // Depth — roles carrying 3–5 substantive bullets.
        const wellDeveloped = roles.filter((r) => {
            const b = toBullets(r.description);
            return b.length >= 3 && b.length <= 6;
        }).length;
        const dRatio = wellDeveloped / roles.length;
        if (dRatio >= 0.6) {
            contentScore += 6;
            feedback.push({
                category: "Content",
                message: "Roles are developed to the right depth.",
                detail: "Your key roles carry 3–5 bullets each — enough to establish context, action, and result without spilling over into noise.",
                solution: "As you add roles, trim the weakest bullet whenever you add a stronger one so no role runs past ~5.",
                type: "success",
                scoreImpact: 6,
            });
        } else {
            contentScore += 2;
            feedback.push({
                category: "Content",
                message: "Roles are too thin — expand your recent experience.",
                detail: "Most roles have fewer than 3 bullets. One-line roles leave the reader guessing at scope: team size, tools, budget, and who the work was for.",
                solution: "Give your two most recent roles 3–5 bullets each using Context → Action → Result. Name the tools and the scale ('for 4 regional teams', 'across a 12k-row dataset').",
                type: "warning",
                scoreImpact: 2,
            });
        }
    }

    // Summary (4) — present, substantial, third-person.
    const summary = (profile.summary || "").trim();
    if (summary.length >= 120 && !PRONOUNS.test(summary)) {
        contentScore += 4;
        feedback.push({
            category: "Content",
            message: "Professional summary is present and well-framed.",
            detail: "A tight, third-person summary frames how the rest of the page is read and is prime keyword real estate for ATS matching.",
            solution: "Tailor its first line per application to echo the target job title — the single highest-leverage keyword edit.",
            type: "success",
            scoreImpact: 4,
        });
    } else if (summary.length > 0) {
        contentScore += 2;
        feedback.push({
            category: "Content",
            message: summary.length < 120 ? "Summary is too short to do its job." : "Summary uses first-person pronouns.",
            detail: summary.length < 120
                ? "A one-line summary wastes the most valuable space on the page and the densest keyword block for ATS."
                : "First-person ('I', 'my') reads informally on a resume and eats characters. Resume summaries are written in implied third person.",
            solution: 'Write 2–3 sentences, no "I/my": role identity + years/level + two or three strongest skills + what you target. E.g. "Data analyst with 2 years in retail forecasting; strong in SQL, Python and dashboard design; targeting product analytics."',
            type: "warning",
            scoreImpact: 2,
        });
    } else {
        feedback.push({
            category: "Content",
            message: "No professional summary — add one.",
            detail: "Without a summary the reader must infer your target role from your history, and the ATS loses the densest keyword block on the page.",
            solution: 'Add 2–3 sentences: role + years, top skills, and what you are targeting. Mirror the job title from the posting in the first line.',
            type: "error",
            scoreImpact: 0,
        });
    }

    // ─── 2. STRUCTURE & FORMAT (20) ──────────────────────────────────────────
    // Sections (8) + volume (6) + bullets present (3) + education complete (3)
    const hasExp = experience.length > 0;
    const hasEdu = education.length > 0;
    const hasSkills = skills.length > 0;
    if (hasExp && hasEdu && hasSkills) {
        structureScore += 8;
        feedback.push({
            category: "Structure",
            message: "All essential sections are present.",
            detail: "Experience, Education and Skills are all present and conventionally named, so ATS section detection will map cleanly.",
            solution: "Keep the standard headings exactly — creative labels break ATS section detection even when they read well.",
            type: "success",
            scoreImpact: 8,
        });
    } else {
        const missingSections = [!hasExp && "Experience", !hasEdu && "Education", !hasSkills && "Skills"].filter(Boolean) as string[];
        feedback.push({
            category: "Structure",
            message: `Missing essential section${missingSections.length > 1 ? "s" : ""}: ${missingSections.join(", ")}.`,
            detail: `Many ATS filters down-rank or reject a resume when an expected section is absent, before a human sees it.`,
            solution: `Add ${missingSections.join(" and ")} using those exact names. Even a sparse Skills block is heavily keyword-weighted and takes two minutes.`,
            type: "error",
            scoreImpact: 0,
        });
    }

    const vlen = visibleText.length;
    if (vlen >= 1200 && vlen <= 5000) {
        structureScore += 6;
        feedback.push({
            category: "Structure",
            message: "Content volume fits a well-spaced page.",
            detail: "Your visible content is dense enough to prove substance and short enough to be read in full — the sweet spot for one page.",
            solution: "Hold this as you tailor: when you add a role, cut the oldest or least relevant rather than spilling to a second page.",
            type: "success",
            scoreImpact: 6,
        });
    } else {
        const tooShort = vlen < 1200;
        structureScore += 2;
        feedback.push({
            category: "Structure",
            message: tooShort ? "Not enough content to fill a convincing page." : "Resume is running long.",
            detail: tooShort
                ? "Sparse resumes read as thin experience even when the candidate is strong."
                : "Past one page for an early-career candidate, reviewers stop reading and the strongest material gets buried.",
            solution: tooShort
                ? "Expand your two most recent roles to 3–5 result bullets and add a Projects section."
                : "Cut to one page: drop roles older than ~6 years, remove any bullet without an outcome, and trim Skills to what the target job asks for.",
            type: "warning",
            scoreImpact: 2,
        });
    }

    if (hasWork && roles.every((r) => toBullets(r.description).length > 0)) {
        structureScore += 3;
    } else if (hasWork) {
        feedback.push({
            category: "Structure",
            message: "Some roles have no bullet points.",
            detail: "A role with a title but no bullets is dead weight — it adds a line to the page without adding evidence.",
            solution: "Give every listed role at least two result-oriented bullets, or remove it if it no longer earns its space.",
            type: "warning",
            scoreImpact: 0,
        });
    }

    const eduComplete = hasEdu && education.every((e) => e.institution && e.degree && (e.startDate || e.endDate || e.current));
    if (eduComplete) {
        structureScore += 3;
    } else if (hasEdu) {
        feedback.push({
            category: "Structure",
            message: "Education entries are missing details.",
            detail: "Incomplete education (no degree, institution, or dates) looks unfinished and can leave ATS fields blank.",
            solution: "For each entry include institution, degree/field, and dates. Add a grade only if it is strong.",
            type: "warning",
            scoreImpact: 0,
        });
    }

    // ─── 3. KEYWORDS & SKILLS (15) ───────────────────────────────────────────
    // With a JD: keyword-match precision. Without: skills-section richness.
    let matched: string[] = [];
    let missing: string[] = [];
    const allSkills = skills.flatMap((s) => s.skills || []).filter(Boolean);

    if (jobDescription && jobDescription.trim().length > 50) {
        const targetKeywords = extractKeywords(jobDescription).slice(0, 15);
        if (targetKeywords.length > 0) {
            const resumeText = visibleText.toLowerCase();
            targetKeywords.forEach((k) => (resumeText.includes(k.toLowerCase()) ? matched.push(k) : missing.push(k)));
            const matchRate = matched.length / targetKeywords.length;
            keywordScore += Math.round(matchRate * 15);
            const topMissing = missing.slice(0, 5).join(", ");
            if (matchRate > 0.7) {
                feedback.push({
                    category: "Keywords",
                    message: "Strong keyword alignment with the job description.",
                    detail: `You match ${matched.length} of ${targetKeywords.length} priority terms (${Math.round(matchRate * 100)}%), clearing the threshold most ATS rankings apply.`,
                    solution: missing.length ? `Work in the rest where genuinely true of you: ${topMissing}.` : "You match every priority term — focus remaining effort on Content and Writing.",
                    type: "success",
                    scoreImpact: Math.round(matchRate * 15),
                });
            } else if (matchRate > 0.4) {
                feedback.push({
                    category: "Keywords",
                    message: "Moderate keyword match — tighten it to the posting.",
                    detail: `You match ${matched.length} of ${targetKeywords.length} priority terms (${Math.round(matchRate * 100)}%). Ranked ATS shortlists usually favour 70%+.`,
                    solution: `Weave these in where accurate: ${topMissing}. Mirror exact wording — "React.js" ≠ "React" to some ATS. Never claim a skill you lack.`,
                    type: "warning",
                    scoreImpact: Math.round(matchRate * 15),
                });
            } else {
                feedback.push({
                    category: "Keywords",
                    message: "Low keyword match — likely filtered before human review.",
                    detail: `You match only ${matched.length} of ${targetKeywords.length} priority terms (${Math.round(matchRate * 100)}%).`,
                    solution: `Restate the target job title in your summary, add a Skills line covering the posting's tools you genuinely use. Missing: ${topMissing}. If most are outside your experience, this posting may be a poor fit.`,
                    type: "error",
                    scoreImpact: Math.round(matchRate * 15),
                });
            }
        }
    } else {
        // No JD: grade the Skills section itself so 100 stays reachable.
        const categorised = skills.length >= 2;
        if (allSkills.length >= 10 && categorised) {
            keywordScore += 15;
            feedback.push({
                category: "Keywords",
                message: "Skills section is rich and organised.",
                detail: `You list ${allSkills.length} concrete skills across ${skills.length} groups. A dense, categorised Skills block is heavily keyword-weighted by ATS.`,
                solution: "Paste a target job description to score keyword *precision* against a specific role — the highest-leverage per-application edit.",
                type: "success",
                scoreImpact: 15,
            });
        } else if (allSkills.length >= 5) {
            keywordScore += 9;
            feedback.push({
                category: "Keywords",
                message: "Skills section is thin — add more concrete tools.",
                detail: `Only ${allSkills.length} skills listed${categorised ? "" : " in a single group"}. Recruiters and ATS scan this block for hard skills; a short list limits your keyword surface.`,
                solution: "List 10+ concrete, real skills grouped by type (e.g. Languages, Tools, Platforms). Then paste a job description to grade precision against a specific posting.",
                type: "warning",
                scoreImpact: 9,
            });
        } else {
            keywordScore += 3;
            feedback.push({
                category: "Keywords",
                message: "Skills section is missing or nearly empty.",
                detail: "Hard skills are where ATS keyword matching lives. With almost none listed, keyword-ranked searches will not surface you.",
                solution: "Add a Skills section with your real tools, languages and platforms, grouped by type. Then paste a job description to measure fit against a specific role.",
                type: "error",
                scoreImpact: 3,
            });
        }
    }

    // ─── 4. WRITING QUALITY (20) ─────────────────────────────────────────────
    // Only graded when there is writing to assess.
    if (!hasWork && writingBullets.length === 0) {
        // nothing to grade → 0, the Content errors already explain why.
    } else {
        writingScore = 20;
        const lowerText = writingBullets.join(" \n ").toLowerCase();

        const weak = countOccurrences(lowerText, WEAK_PHRASES);
        if (weak.length > 0) {
            writingScore -= 5;
            feedback.push({
                category: "Writing",
                message: 'Weak, passive phrasing found (e.g. "Responsible for").',
                detail: `Found: ${weak.slice(0, 4).map((w) => `"${w}"`).join(", ")}. These describe proximity to work rather than ownership, and waste space that could carry a result.`,
                solution: '"Responsible for X" → "Ran X, delivering [result]". "Helped with X" → name your specific contribution. Claim what you owned, however small.',
                type: "warning",
                scoreImpact: -5,
            });
        }

        const buzz = countOccurrences(lowerText, BUZZWORDS);
        if (buzz.length > 0) {
            writingScore -= 5;
            feedback.push({
                category: "Writing",
                message: "Clichés / buzzwords found — show, don't tell.",
                detail: `Found: ${buzz.slice(0, 4).map((w) => `"${w}"`).join(", ")}. Self-assessed traits carry no evidence; every applicant claims them.`,
                solution: '"Team player" → "Coordinated across design and QA to ship on a 3-week cycle." Replace each trait with the evidence behind it.',
                type: "warning",
                scoreImpact: -5,
            });
        }

        const filler = countOccurrences(lowerText, FILLER);
        if (filler.length >= 2) {
            writingScore -= 3;
            feedback.push({
                category: "Writing",
                message: "Filler words are diluting your bullets.",
                detail: `Found: ${filler.slice(0, 4).map((w) => `"${w}"`).join(", ")}. Words like "very", "successfully" and "leverage" add length without meaning.`,
                solution: "Cut every word that doesn't change the sentence's meaning. Tight writing signals clear thinking.",
                type: "warning",
                scoreImpact: -3,
            });
        }

        // Overly long bullets.
        const longBullets = writingBullets.filter((b) => b.length > 240).length;
        if (longBullets > 0) {
            writingScore -= 4;
            feedback.push({
                category: "Writing",
                message: `${longBullets} bullet${longBullets > 1 ? "s run" : " runs"} too long.`,
                detail: "Bullets over ~2 lines lose the reader, who scans only the first ~6 words of each line. Long bullets bury the outcome.",
                solution: "Split each long bullet into one idea per line, two lines maximum, with the result front-loaded.",
                type: "warning",
                scoreImpact: -4,
            });
        }

        // Repeated opening verb.
        const openers = allBullets.map((b) => b.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean) as string[];
        const counts = openers.reduce<Record<string, number>>((m, v) => ((m[v] = (m[v] || 0) + 1), m), {});
        const repeated = Object.entries(counts).find(([, n]) => n >= 3);
        if (repeated) {
            writingScore -= 3;
            feedback.push({
                category: "Writing",
                message: `The verb "${repeated[0]}" opens ${repeated[1]} bullets.`,
                detail: "Repeating the same opener flattens impact and reads as monotony to a human reviewer.",
                solution: "Vary openers so none repeats more than twice: Led, Built, Launched, Streamlined, Negotiated, Rebuilt, Drove.",
                type: "warning",
                scoreImpact: -3,
            });
        }

        writingScore = Math.max(0, writingScore);
        if (writingScore === 20) {
            feedback.push({
                category: "Writing",
                message: "Tight, active, evidence-led writing.",
                detail: "No weak phrasing, clichés, filler, over-long bullets, or repeated openers. Your bullets assert ownership and stay scannable.",
                solution: "Final pass: read each bullet aloud and cut any word that doesn't change its meaning.",
                type: "success",
                scoreImpact: 20,
            });
        }
    }

    // ─── 5. APPLICATION READY (15) ───────────────────────────────────────────
    // Contact (6) + link (3) + dates (3) + polish (3)
    const { email, phone, location, linkedin, website } = profile;
    if (email && phone && location) {
        applicationScore += 6;
        feedback.push({
            category: "Application",
            message: "Contact information is complete.",
            detail: "Email, phone and location are all present. A missing contact field is a common silent rejection.",
            solution: 'Check the email reads professionally and location is "City, Country" (or "City, State").',
            type: "success",
            scoreImpact: 6,
        });
    } else {
        const missingContact = [!email && "email", !phone && "phone", !location && "location"].filter(Boolean) as string[];
        feedback.push({
            category: "Application",
            message: `Incomplete contact details: ${missingContact.join(", ")}.`,
            detail: "ATS platforms populate the candidate record from these fields; a blank one can leave your application incomplete on the recruiter's side.",
            solution: `Add your ${missingContact.join(", ")}. Use a personal email you check daily, not a university or work address that may expire.`,
            type: "error",
            scoreImpact: 0,
        });
    }

    if (linkedin || website) {
        applicationScore += 3;
    } else {
        feedback.push({
            category: "Application",
            message: "Add a LinkedIn profile or portfolio link.",
            detail: "For early-career candidates the strongest evidence often lives off-page: projects, recommendations, and work samples that won't fit here.",
            solution: "Add your LinkedIn at minimum. If you write code or design, a GitHub or portfolio link is worth more than another bullet.",
            type: "warning",
            scoreImpact: 0,
        });
    }

    // Dates on experience.
    const datedRoles = experience.filter((e) => e.startDate && (e.endDate || e.current)).length;
    if (!hasExp || datedRoles === experience.length) {
        applicationScore += 3;
    } else {
        feedback.push({
            category: "Application",
            message: "Some roles are missing dates.",
            detail: "Undated roles create the impression of gaps or padding, and recruiters read missing dates as something being hidden.",
            solution: "Add start and end dates (or 'Present') to every role. Consistent MM/YYYY formatting throughout reads as polish.",
            type: "warning",
            scoreImpact: 0,
        });
    }

    // Polish: no future dates, no double spaces, no lowercase standalone "i".
    const currentYear = new Date().getFullYear();
    const years = (visibleText.match(/\b(19|20)\d{2}\b/g) || []).map(Number);
    const futureDated = years.some((y) => y > currentYear + 1);
    const doubleSpace = /\S {2,}\S/.test(visibleText);
    const lowerI = /\bi\b/.test(" " + (writingBullets.join(" ") + " " + summary));
    if (!futureDated && !doubleSpace && !lowerI && hasWork) {
        applicationScore += 3;
    } else if (hasWork) {
        const issues = [
            futureDated && "a date in the future",
            doubleSpace && "double spaces",
            lowerI && 'a lowercase "i"',
        ].filter(Boolean) as string[];
        feedback.push({
            category: "Application",
            message: "Small polish issues are showing.",
            detail: `Found: ${issues.join(", ")}. Recruiters read careless details on a resume as careless work.`,
            solution: "Fix the flagged items, then proofread once end to end (or read it aloud). Typos are one of the fastest silent rejections.",
            type: "warning",
            scoreImpact: 0,
        });
    }

    // ─── Compile ─────────────────────────────────────────────────────────────
    const categoryScores: Record<string, CategoryScore> = {
        Content: { name: "Content & Impact", score: contentScore, maxScore: 30, feedback: feedback.filter((f) => f.category === "Content") },
        Structure: { name: "Structure & Format", score: structureScore, maxScore: 20, feedback: feedback.filter((f) => f.category === "Structure") },
        Keywords: { name: "Keywords & Skills", score: keywordScore, maxScore: 15, feedback: feedback.filter((f) => f.category === "Keywords") },
        Writing: { name: "Writing Quality", score: writingScore, maxScore: 20, feedback: feedback.filter((f) => f.category === "Writing") },
        Application: { name: "Application Ready", score: applicationScore, maxScore: 15, feedback: feedback.filter((f) => f.category === "Application") },
    };

    const overallScore = contentScore + structureScore + keywordScore + writingScore + applicationScore;

    return {
        overallScore: Math.min(100, Math.max(0, overallScore)),
        categoryScores,
        feedback,
        matchedKeywords: matched,
        missingKeywords: missing,
    };
}

/**
 * Rank feedback worst-first so the free tier's truncated list surfaces the
 * issues that actually cost the most points, not whichever ran first.
 */
export function prioritizeFeedback(feedback: ATSFeedback[]): ATSFeedback[] {
    const severity = { error: 0, warning: 1, success: 2 } as const;
    return [...feedback].sort((a, b) => severity[a.type] - severity[b.type]);
}
