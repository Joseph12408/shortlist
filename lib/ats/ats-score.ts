/* Reference content: check task.md for actual tasks. Logic being implemented in ats-score.ts */
import { extractKeywords } from "./keyword-extractor";
import { Resume } from "@/types/resume";

export interface ATSFeedback {
    category: 'Content' | 'Structure' | 'Keywords' | 'Writing' | 'Application';
    message: string;
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
        resume.experience.forEach(e => {
            const desc = e.description?.toLowerCase() || '';
            if (/\d+|%|\$|increased|reduced|saved|grew|led/.test(desc)) metricsCount++;
            // Basic check if bullets start with action verbs (approximate by looking for typical verbs at newline/starts)
            if (/^(managed|led|designed|developed|built|created|improved|increased|implemented|delivered)/im.test(desc)) actionVerbCount++;
        });

        const metricRatio = metricsCount / resume.experience.length;
        if (metricRatio >= 0.8) {
            contentScore += 10;
            feedback.push({ category: 'Content', message: 'Excellent use of quantifiable metrics across roles.', type: 'success', scoreImpact: 10 });
        } else if (metricRatio >= 0.4) {
            contentScore += 5;
            feedback.push({ category: 'Content', message: 'Good metrics, but quantify achievements in more roles.', type: 'warning', scoreImpact: 5 });
        } else {
            feedback.push({ category: 'Content', message: 'Add numbers, percentages, or dollar amounts to quantify achievements.', type: 'error', scoreImpact: 0 });
        }

        // Action verb usage
        if (actionVerbCount > 0) {
            contentScore += 5;
            feedback.push({ category: 'Content', message: 'Strong action verbs detected at start of bullets.', type: 'success', scoreImpact: 5 });
        } else {
            feedback.push({ category: 'Content', message: 'Start bullet points with strong action verbs (e.g., Managed, Delivered).', type: 'warning', scoreImpact: 0 });
        }

        // Check for depth (description length)
        const avgLength = resume.experience.reduce((acc, curr) => acc + (curr.description?.length || 0), 0) / resume.experience.length;
        if (avgLength > 150) {
            contentScore += 10;
            feedback.push({ category: 'Content', message: 'Good depth in role descriptions.', type: 'success', scoreImpact: 10 });
        } else {
            contentScore += 5;
            feedback.push({ category: 'Content', message: 'Expand on role descriptions. Explain "how" and "why", not just "what".', type: 'warning', scoreImpact: 5 });
        }
    } else {
        feedback.push({ category: 'Content', message: 'No experience listed. This significantly hurts your score.', type: 'error', scoreImpact: 0 });
    }

    // Summary presence and quality
    if (resume.profile.summary && resume.profile.summary.trim().length > 50) {
        contentScore += 5;
        feedback.push({ category: 'Content', message: 'Professional summary is present and detailed.', type: 'success', scoreImpact: 5 });
    } else {
        feedback.push({ category: 'Content', message: 'Missing or too short professional summary. Add one to boost your score.', type: 'error', scoreImpact: 0 });
    }

    // --- 2. ATS & Structure (20 pts) ---
    // Core sections check
    const hasExp = resume.experience.length > 0;
    const hasEdu = resume.education.length > 0;
    const hasSkills = resume.skills.length > 0;

    if (hasExp && hasEdu && hasSkills) {
        structureScore += 10;
        feedback.push({ category: 'Structure', message: 'All essential sections (Experience, Education, Skills) are present.', type: 'success', scoreImpact: 10 });
    } else {
        feedback.push({ category: 'Structure', message: 'Missing essential sections. Ensure Experience, Education, and Skills are included.', type: 'error', scoreImpact: 0 });
    }

    // Length Check
    const totalContent = JSON.stringify(resume).length;
    if (totalContent > 1500 && totalContent < 6000) {
        structureScore += 10;
        feedback.push({ category: 'Structure', message: 'Optimal resume length for ATS parsing.', type: 'success', scoreImpact: 10 });
    } else {
        feedback.push({ category: 'Structure', message: 'Resume might be too short or too long. Aim for dense content.', type: 'warning', scoreImpact: 0 });
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

            if (matchRate > 0.6) {
                feedback.push({ category: 'Keywords', message: 'Strong keyword alignment with the job description.', type: 'success', scoreImpact: pts });
            } else if (matchRate > 0.3) {
                feedback.push({ category: 'Keywords', message: 'Moderate keyword match. Review missing terms.', type: 'warning', scoreImpact: pts });
            } else {
                feedback.push({ category: 'Keywords', message: 'Low keyword match. Tailor your resume more closely to the JD.', type: 'error', scoreImpact: pts });
            }
        } else {
            keywordScore += 10;
            feedback.push({ category: 'Keywords', message: 'Could not extract specific keywords, assuming general fit.', type: 'warning', scoreImpact: 10 });
        }
    } else {
        keywordScore += 10; // Penalty for no JD
        feedback.push({ category: 'Keywords', message: 'No job description provided. Add a JD to unlock accurate keyword scoring.', type: 'warning', scoreImpact: 10 });
    }

    // --- 4. Writing Quality (15 pts) ---
    const weakWords = ['responsible for', 'helped', 'assisted', 'worked on'];
    const buzzwords = ['synergy', 'passionate', 'team player', 'go-getter', 'thought leader'];
    const resumeStrLower = JSON.stringify(resume).toLowerCase();
    
    let writingPenalty = 0;
    
    const hasWeakWords = weakWords.some(w => resumeStrLower.includes(w));
    if (hasWeakWords) {
        writingPenalty += 5;
        feedback.push({ category: 'Writing', message: 'Avoid passive phrases like "Responsible for". Use action verbs.', type: 'warning', scoreImpact: -5 });
    }
    
    const hasBuzzwords = buzzwords.some(w => resumeStrLower.includes(w));
    if (hasBuzzwords) {
        writingPenalty += 5;
        feedback.push({ category: 'Writing', message: 'Avoid cliches and buzzwords (e.g., "team player", "synergy"). Show, don\'t tell.', type: 'warning', scoreImpact: -5 });
    }

    writingScore = Math.max(0, 15 - writingPenalty);
    if (writingPenalty === 0) {
        feedback.push({ category: 'Writing', message: 'Strong, active language with no buzzwords detected.', type: 'success', scoreImpact: 15 });
    } else if (writingPenalty < 10) {
        feedback.push({ category: 'Writing', message: 'Writing is okay, but can be more active and direct.', type: 'success', scoreImpact: writingScore });
    }

    // --- 5. Application Ready (15 pts) ---
    const { email, phone, location, linkedin } = resume.profile;
    if (email && phone && location) {
        applicationScore += 10;
        feedback.push({ category: 'Application', message: 'Contact information is complete.', type: 'success', scoreImpact: 10 });
    } else {
        feedback.push({ category: 'Application', message: 'Ensure Email, Phone, and Location are all valid.', type: 'error', scoreImpact: 0 });
    }

    if (linkedin || resume.profile.website) {
        applicationScore += 5;
        feedback.push({ category: 'Application', message: 'Professional links included.', type: 'success', scoreImpact: 5 });
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
