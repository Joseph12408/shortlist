/* Reference content: check task.md for actual tasks. Logic being implemented in ats-score.ts */
import { extractKeywords } from "./keyword-extractor";
import { Resume } from "@/types/resume";

export interface ATSFeedback {
    category: 'Content' | 'Structure' | 'Keywords' | 'Writing' | 'Application';
    /** One-line verdict. Shown to every user, including free. */
    message: string;
    /**
     * Why this matters: the reasoning behind the verdict.
     * Pro only: this is the "detailed explanation" half of the paid tier.
     */
    detail?: string;
    /**
     * Concrete, actionable fix the user can apply right now.
     * Pro only: this is the "solution" half of the paid tier.
     */
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

export function analyzeResume(resume: Resume, jobDescription: string): ATSAnalysisResult {
    const feedback: ATSFeedback[] = [];
    let contentScore = 0;
    let structureScore = 0;
    let keywordScore = 0;
    let writingScore = 0;
    let applicationScore = 0;

    // --- 1. Content Quality (30 pts) ---
    // Metrics: Usage of numbers, results-oriented language
    // Depth: Experience length, descriptions
    // Action verbs and summary presence

    if (resume.experience.length > 0) {
        // Quantifiable metrics across all entries
        let metricsCount = 0;
        let actionVerbCount = 0;
        const rolesWithoutMetrics: string[] = [];

        resume.experience.forEach(e => {
            const desc = e.description?.toLowerCase() || '';
            if (/\d+|%|\$|increased|reduced|saved|grew|led/.test(desc)) {
                metricsCount++;
            } else {
                rolesWithoutMetrics.push(e.title || e.company || 'an untitled role');
            }
            // Basic check if bullets start with action verbs (approximate by looking for typical verbs at newline/starts)
            if (/^(managed|led|designed|developed|built|created|improved|increased|implemented|delivered)/im.test(desc)) actionVerbCount++;
        });

        const metricRatio = metricsCount / resume.experience.length;
        if (metricRatio >= 0.8) {
            contentScore += 10;
            feedback.push({
                category: 'Content',
                message: 'Excellent use of quantifiable metrics across roles.',
                detail: `${metricsCount} of ${resume.experience.length} roles contain numbers, percentages or outcome verbs. Recruiters spend roughly 7 seconds on a first pass, and figures are what survive that scan. They turn a claim into evidence.`,
                solution: 'Keep this up. For an extra edge, make sure the single most impressive number on the resume sits in your top-most role, where the eye lands first.',
                type: 'success',
                scoreImpact: 10,
            });
        } else if (metricRatio >= 0.4) {
            contentScore += 5;
            feedback.push({
                category: 'Content',
                message: 'Good metrics, but quantify achievements in more roles.',
                detail: `Only ${metricsCount} of ${resume.experience.length} roles include measurable results. Roles without numbers read as job descriptions rather than accomplishments, and reviewers discount them.`,
                solution: `Add at least one number to: ${rolesWithoutMetrics.slice(0, 3).join(', ')}. Use the pattern "[action] [metric] by [amount] in [timeframe]", for example "Cut onboarding time 40% over two quarters". If you lack exact figures, an honest estimate with a qualifier ("~", "approximately") is still far stronger than none.`,
                type: 'warning',
                scoreImpact: 5,
            });
        } else {
            feedback.push({
                category: 'Content',
                message: 'Add numbers, percentages, or dollar amounts to quantify achievements.',
                detail: `Almost none of your ${resume.experience.length} role${resume.experience.length === 1 ? '' : 's'} contain measurable outcomes. This is the single largest scoring gap on most early-career resumes: without figures, every candidate\'s bullets read the same.`,
                solution: 'For each role ask: how many, how much, how often, how fast? Volume handled, money saved, time cut, people supported, percentage improved. Rewrite your top three bullets to lead with the result, then the method, for example "Reduced report prep from 6 hours to 45 minutes by automating data pulls".',
                type: 'error',
                scoreImpact: 0,
            });
        }

        // Action verb usage
        if (actionVerbCount > 0) {
            contentScore += 5;
            feedback.push({
                category: 'Content',
                message: 'Strong action verbs detected at start of bullets.',
                detail: 'Leading with a verb puts the emphasis on what you did rather than what you were assigned, which reads as ownership.',
                solution: 'Vary the verbs so they do not repeat across roles. Reusing "Managed" five times flattens the impact. Swap in Led, Built, Launched, Streamlined, Negotiated, Rebuilt as they fit.',
                type: 'success',
                scoreImpact: 5,
            });
        } else {
            feedback.push({
                category: 'Content',
                message: 'Start bullet points with strong action verbs (e.g., Managed, Delivered).',
                detail: 'None of your bullets open with a recognised action verb. Bullets that start with "Responsible for" or a noun phrase describe a job rather than your contribution to it.',
                solution: 'Rewrite each bullet to open with a past-tense verb. "Responsible for the weekly report" becomes "Produced the weekly revenue report for a 30-person sales team". Strong openers: Led, Built, Designed, Delivered, Launched, Reduced, Automated, Negotiated.',
                type: 'warning',
                scoreImpact: 0,
            });
        }

        // Check for depth (description length)
        const avgLength = resume.experience.reduce((acc, curr) => acc + (curr.description?.length || 0), 0) / resume.experience.length;
        if (avgLength > 150) {
            contentScore += 10;
            feedback.push({
                category: 'Content',
                message: 'Good depth in role descriptions.',
                detail: `Your descriptions average ~${Math.round(avgLength)} characters, enough room to establish context, action and result rather than just a job title.`,
                solution: 'Watch the upper bound as you add more: past roughly 5 bullets per role, readers skim. Trim the weakest bullet whenever you add a stronger one.',
                type: 'success',
                scoreImpact: 10,
            });
        } else {
            contentScore += 5;
            feedback.push({
                category: 'Content',
                message: 'Expand on role descriptions. Explain "how" and "why", not just "what".',
                detail: `Your descriptions average only ~${Math.round(avgLength)} characters. That is typically one thin line per role, which leaves the reader guessing at scope: team size, budget, tools, and who the work was for.`,
                solution: 'Target 3-5 bullets per recent role. For each, use Context, then Action, then Result: what problem existed, what you specifically did, and what changed as a result. Name the tools and the scale ("for 4 regional teams", "across a 12k-row dataset").',
                type: 'warning',
                scoreImpact: 5,
            });
        }
    } else {
        feedback.push({
            category: 'Content',
            message: 'No experience listed. This significantly hurts your score.',
            detail: 'The Experience section carries the most weight in both ATS parsing and human review. An empty one caps your achievable score at well under half.',
            solution: 'Add anything with real deliverables: internships, freelance or contract work, university projects, society or volunteer roles. Early-career resumes are allowed to lead with coursework and projects. What matters is that the work is described in terms of outcomes.',
            type: 'error',
            scoreImpact: 0,
        });
    }

    // Summary presence and quality
    if (resume.profile.summary && resume.profile.summary.trim().length > 50) {
        contentScore += 5;
        feedback.push({
            category: 'Content',
            message: 'Professional summary is present and detailed.',
            detail: 'A summary is the one place you get to frame how the rest of the page should be read, and it is prime keyword real estate for ATS matching.',
            solution: 'Tailor the summary per application. Mirror the job title from the posting in its first line. That single change lifts keyword match rate more than any other edit.',
            type: 'success',
            scoreImpact: 5,
        });
    } else {
        feedback.push({
            category: 'Content',
            message: 'Missing or too short professional summary. Add one to boost your score.',
            detail: 'Without a summary the reader has to infer your target role from your history, and the ATS loses the densest keyword block on the page.',
            solution: 'Write 2-3 sentences: your role and years of experience, your strongest two or three skills, and what you are targeting. Example: "Data analyst with 2 years in retail forecasting. Strong in SQL, Python and dashboard design. Looking to move into a product analytics role."',
            type: 'error',
            scoreImpact: 0,
        });
    }

    // --- 2. ATS & Structure (20 pts) ---
    // Core sections check
    const hasExp = resume.experience.length > 0;
    const hasEdu = resume.education.length > 0;
    const hasSkills = resume.skills.length > 0;

    if (hasExp && hasEdu && hasSkills) {
        structureScore += 10;
        feedback.push({
            category: 'Structure',
            message: 'All essential sections (Experience, Education, Skills) are present.',
            detail: 'Applicant tracking systems map your resume onto a fixed schema. All three expected sections are present and named conventionally, so parsing should be clean.',
            solution: 'Keep the standard headings exactly as they are. Creative labels like "Where I have been" break ATS section detection even though they read well to a human.',
            type: 'success',
            scoreImpact: 10,
        });
    } else {
        const missingSections = [
            !hasExp && 'Experience',
            !hasEdu && 'Education',
            !hasSkills && 'Skills',
        ].filter(Boolean) as string[];

        feedback.push({
            category: 'Structure',
            message: 'Missing essential sections. Ensure Experience, Education, and Skills are included.',
            detail: `Missing: ${missingSections.join(', ')}. Many ATS filters reject or down-rank a resume outright when an expected section cannot be found, before a human ever sees it.`,
            solution: `Add ${missingSections.join(' and ')} using those exact section names. Even a sparse section beats an absent one. A Skills block listing your tools takes two minutes and is heavily keyword-weighted.`,
            type: 'error',
            scoreImpact: 0,
        });
    }

    // Length Check
    const totalContent = JSON.stringify(resume).length;
    if (totalContent > 1500 && totalContent < 6000) {
        structureScore += 10;
        feedback.push({
            category: 'Structure',
            message: 'Optimal resume length for ATS parsing.',
            detail: 'Your content volume lands in the range that fits one well-spaced page: dense enough to prove substance, short enough to be read in full.',
            solution: 'Hold this length as you tailor per application. When you add a role, cut the oldest or least relevant one rather than letting it spill onto a second page.',
            type: 'success',
            scoreImpact: 10,
        });
    } else {
        const tooShort = totalContent <= 1500;
        feedback.push({
            category: 'Structure',
            message: 'Resume might be too short or too long. Aim for dense content.',
            detail: tooShort
                ? 'There is not yet enough content to fill a convincing page. Sparse resumes read as thin experience even when the candidate is strong.'
                : 'The resume is running long. Past one page for an early-career candidate, reviewers stop reading and the strongest material gets buried.',
            solution: tooShort
                ? 'Expand your two most recent roles to 3-5 result-oriented bullets each, and add a Projects section. Side and academic projects legitimately count at this stage.'
                : 'Cut to one page: drop roles older than ~6 years, remove any bullet without a concrete outcome, and compress your Skills list to what the target job actually asks for.',
            type: 'warning',
            scoreImpact: 0,
        });
    }

    // --- 3. Job Optimization (20 pts) ---
    let matched: string[] = [];
    let missing: string[] = [];

    if (jobDescription && jobDescription.trim().length > 50) {
        const jdKeywords = extractKeywords(jobDescription);
        const targetKeywords = jdKeywords.slice(0, 15);

        if (targetKeywords.length > 0) {
            const resumeText = JSON.stringify(resume).toLowerCase();
            targetKeywords.forEach(k => {
                if (resumeText.includes(k.toLowerCase())) matched.push(k);
                else missing.push(k);
            });

            const matchRate = matched.length / targetKeywords.length;
            const pts = Math.round(matchRate * 20);
            keywordScore += pts;

            const topMissing = missing.slice(0, 5).join(', ');

            if (matchRate > 0.6) {
                feedback.push({
                    category: 'Keywords',
                    message: 'Strong keyword alignment with the job description.',
                    detail: `You match ${matched.length} of ${targetKeywords.length} high-priority terms (${Math.round(matchRate * 100)}%). That clears the keyword threshold most ATS rankings apply.`,
                    solution: missing.length
                        ? `To push higher, work in the remaining terms where they are genuinely true of you: ${topMissing}.`
                        : 'You are matching every priority term. Focus your remaining effort on the Content and Writing categories.',
                    type: 'success',
                    scoreImpact: pts,
                });
            } else if (matchRate > 0.3) {
                feedback.push({
                    category: 'Keywords',
                    message: 'Moderate keyword match. Review missing terms.',
                    detail: `You match ${matched.length} of ${targetKeywords.length} priority terms (${Math.round(matchRate * 100)}%). Ranked ATS shortlists usually favour candidates above roughly 60%, so this may not surface you.`,
                    solution: `Weave these into your summary, skills and bullets where they are accurate: ${topMissing}. Mirror the posting's exact wording: an ATS matching on "React.js" will not always credit "React". Never claim a skill you do not have; instead surface the closest genuine equivalent.`,
                    type: 'warning',
                    scoreImpact: pts,
                });
            } else {
                feedback.push({
                    category: 'Keywords',
                    message: 'Low keyword match. Tailor your resume more closely to the JD.',
                    detail: `You match only ${matched.length} of ${targetKeywords.length} priority terms (${Math.round(matchRate * 100)}%). At this level the application is likely filtered out before human review, regardless of how strong your experience is.`,
                    solution: `Start with the summary: restate the target job title verbatim. Then add a Skills line covering the tools named in the posting that you genuinely use. Highest-value terms missing right now: ${topMissing}. If most of these are genuinely outside your experience, this posting may simply be a poor fit. That is useful signal too.`,
                    type: 'error',
                    scoreImpact: pts,
                });
            }
        } else {
            keywordScore += 10;
            feedback.push({
                category: 'Keywords',
                message: 'Could not extract specific keywords, assuming general fit.',
                detail: 'The pasted text did not yield distinctive terms. It may be mostly company boilerplate or benefits copy rather than role requirements.',
                solution: 'Paste the "Requirements", "Qualifications" or "What you will do" section specifically, rather than the whole posting.',
                type: 'warning',
                scoreImpact: 10,
            });
        }
    } else {
        keywordScore += 10; // Neutral baseline when there is no JD to match against
        feedback.push({
            category: 'Keywords',
            message: 'No job description provided. Add a JD to unlock accurate keyword scoring.',
            detail: 'Without a target posting this category is scored at a neutral baseline, so your overall figure is a general-quality score rather than a fit score for a specific job.',
            solution: 'Paste the job description you are applying to. Keyword alignment is the single highest-leverage change you can make per application, and it can only be measured against a real posting.',
            type: 'warning',
            scoreImpact: 10,
        });
    }

    // --- 4. Writing Quality (15 pts) ---
    const weakWords = ['responsible for', 'helped', 'assisted', 'worked on'];
    const buzzwords = ['synergy', 'passionate', 'team player', 'go-getter', 'thought leader'];
    const resumeStrLower = JSON.stringify(resume).toLowerCase();

    let writingPenalty = 0;

    const foundWeakWords = weakWords.filter(w => resumeStrLower.includes(w));
    if (foundWeakWords.length > 0) {
        writingPenalty += 5;
        feedback.push({
            category: 'Writing',
            message: 'Avoid passive phrases like "Responsible for". Use action verbs.',
            detail: `Found: ${foundWeakWords.map(w => `"${w}"`).join(', ')}. These phrases describe proximity to work rather than ownership of it, and they consume space that could carry a result.`,
            solution: '"Responsible for X" becomes "Ran X, delivering [result]". "Helped with X" becomes naming your specific contribution: "Built the reporting layer of X". "Assisted" becomes stating what you personally owned, however small; a narrow claim you own outright beats a vague share of a big one.',
            type: 'warning',
            scoreImpact: -5,
        });
    }

    const foundBuzzwords = buzzwords.filter(w => resumeStrLower.includes(w));
    if (foundBuzzwords.length > 0) {
        writingPenalty += 5;
        feedback.push({
            category: 'Writing',
            message: 'Avoid cliches and buzzwords (e.g., "team player", "synergy"). Show, don\'t tell.',
            detail: `Found: ${foundBuzzwords.map(w => `"${w}"`).join(', ')}. Self-assessed traits carry no evidence. Every applicant claims them, so they read as filler.`,
            solution: 'Replace each with the evidence behind it. "Team player" becomes "Coordinated across design and QA to ship on a 3-week cycle". "Passionate about X" becomes a project you built in X on your own time.',
            type: 'warning',
            scoreImpact: -5,
        });
    }

    writingScore = Math.max(0, 15 - writingPenalty);
    if (writingPenalty === 0) {
        feedback.push({
            category: 'Writing',
            message: 'Strong, active language with no buzzwords detected.',
            detail: 'No passive constructions or cliches found. Your bullets assert ownership and avoid unverifiable self-description.',
            solution: 'Final pass: read each bullet aloud and cut any word that does not change its meaning. Tight writing signals clear thinking.',
            type: 'success',
            scoreImpact: 15,
        });
    } else if (writingPenalty < 10) {
        feedback.push({
            category: 'Writing',
            message: 'Writing is okay, but can be more active and direct.',
            detail: 'Most of your writing is solid; the flagged phrases above are what is holding this category back.',
            solution: 'Fix the specific phrases listed above. It is usually a 10-minute edit worth a full 5 points.',
            type: 'success',
            scoreImpact: writingScore,
        });
    }

    // --- 5. Application Ready (15 pts) ---
    const { email, phone, location, linkedin } = resume.profile;
    if (email && phone && location) {
        applicationScore += 10;
        feedback.push({
            category: 'Application',
            message: 'Contact information is complete.',
            detail: 'Email, phone and location are all present. Missing contact fields are a common silent rejection: a recruiter who cannot reach you moves on.',
            solution: 'Check the email reads professionally and that location is written as "City, Country" (or "City, State"). Remote-friendly postings still filter on region for timezone and right-to-work reasons.',
            type: 'success',
            scoreImpact: 10,
        });
    } else {
        const missingContact = [
            !email && 'email',
            !phone && 'phone',
            !location && 'location',
        ].filter(Boolean) as string[];

        feedback.push({
            category: 'Application',
            message: 'Ensure Email, Phone, and Location are all valid.',
            detail: `Missing: ${missingContact.join(', ')}. ATS platforms populate their candidate record from these fields; a blank one can leave your application incomplete on the recruiter's side.`,
            solution: `Add your ${missingContact.join(', ')} to the Profile section. Use a personal email you check daily rather than a university or work address that may expire.`,
            type: 'error',
            scoreImpact: 0,
        });
    }

    if (linkedin || resume.profile.website) {
        applicationScore += 5;
        feedback.push({
            category: 'Application',
            message: 'Professional links included.',
            detail: 'A LinkedIn or portfolio link gives reviewers somewhere to verify and expand on what the page claims, which matters most when your experience is still short.',
            solution: 'Make sure the linked profile is current and consistent with this resume. Conflicting dates or titles between the two is a recognised red flag.',
            type: 'success',
            scoreImpact: 5,
        });
    } else {
        feedback.push({
            category: 'Application',
            message: 'Add a LinkedIn profile or portfolio link.',
            detail: 'No professional link found. For early-career candidates this is often where the strongest evidence lives: projects, recommendations, and work samples that will not fit on one page.',
            solution: 'Add your LinkedIn URL at minimum. If you write code or design, a GitHub or portfolio link is worth more than another bullet point.',
            type: 'warning',
            scoreImpact: 0,
        });
    }

    // Compile Result
    const categoryScores: Record<string, CategoryScore> = {
        'Content': { name: 'Content Quality', score: contentScore, maxScore: 30, feedback: feedback.filter(f => f.category === 'Content') },
        'Structure': { name: 'ATS & Structure', score: structureScore, maxScore: 20, feedback: feedback.filter(f => f.category === 'Structure') },
        'Keywords': { name: 'Job Optimization', score: keywordScore, maxScore: 20, feedback: feedback.filter(f => f.category === 'Keywords') },
        'Writing': { name: 'Writing Quality', score: writingScore, maxScore: 15, feedback: feedback.filter(f => f.category === 'Writing') },
        'Application': { name: 'Application Ready', score: applicationScore, maxScore: 15, feedback: feedback.filter(f => f.category === 'Application') }
    };

    const overallScore = contentScore + structureScore + keywordScore + writingScore + applicationScore;

    return {
        overallScore: Math.min(100, Math.max(0, overallScore)),
        categoryScores,
        feedback,
        matchedKeywords: matched,
        missingKeywords: missing
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
