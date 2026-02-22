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

    if (resume.experience.length > 0) {
        // Check for quantifiable metrics
        const hasNumbers = resume.experience.some(e => /\d+|%|\$|increased|reduced|saved|grew/.test(e.description?.toLowerCase() || ''));
        if (hasNumbers) {
            contentScore += 15;
            feedback.push({ category: 'Content', message: 'Great use of quantifiable metrics/action verbs.', type: 'success', scoreImpact: 15 });
        } else {
            contentScore += 5;
            feedback.push({ category: 'Content', message: 'Add numbers, percentages, or dollar amounts to quantify achievements.', type: 'warning', scoreImpact: 5 });
        }

        // Check for depth (description length)
        const avgLength = resume.experience.reduce((acc, curr) => acc + (curr.description?.length || 0), 0) / resume.experience.length;
        if (avgLength > 100) {
            contentScore += 15;
            feedback.push({ category: 'Content', message: 'Good depth in role descriptions.', type: 'success', scoreImpact: 15 });
        } else {
            contentScore += 5;
            feedback.push({ category: 'Content', message: 'Expand on role descriptions. Explain "how" and "why", not just "what".', type: 'warning', scoreImpact: 5 });
        }
    } else {
        feedback.push({ category: 'Content', message: 'No experience listed. This significantly hurts your score.', type: 'error', scoreImpact: 0 });
    }

    // --- 2. ATS & Structure (20 pts) ---
    // Sections, Contact Info, Length

    // Core sections check
    const hasExp = resume.experience.length > 0;
    const hasEdu = resume.education.length > 0;
    const hasSkills = resume.skills.length > 0;
    const hasSummary = !!resume.profile.summary;

    if (hasExp && hasEdu && hasSkills) {
        structureScore += 10;
        feedback.push({ category: 'Structure', message: 'All essential sections (Experience, Education, Skills) are present.', type: 'success', scoreImpact: 10 });
    } else {
        feedback.push({ category: 'Structure', message: 'Missing essential sections. Ensure Experience, Education, and Skills are included.', type: 'error', scoreImpact: 0 });
    }

    // Length Check
    const totalContent = JSON.stringify(resume).length;
    // Rough estimation: 3000 chars ~ 400-500 words
    if (totalContent > 1500 && totalContent < 6000) {
        structureScore += 10;
        feedback.push({ category: 'Structure', message: 'Optimal resume length for ATS parsing.', type: 'success', scoreImpact: 10 });
    } else {
        feedback.push({ category: 'Structure', message: 'Resume might be too short or too long. Aim for 1-2 pages of dense content.', type: 'warning', scoreImpact: 0 });
    }

    // --- 3. Job Optimization (20 pts) ---
    // Keywords matching JD

    let matched: string[] = [];
    let missing: string[] = [];

    if (jobDescription && jobDescription.trim().length > 50) {
        const jdKeywords = extractKeywords(jobDescription);
        const targetKeywords = jdKeywords.slice(0, 15); // Top 15 keywords

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
            // Fallback if extraction fails
            keywordScore += 20;
            feedback.push({ category: 'Keywords', message: 'Could not extract specific keywords, assuming general fit.', type: 'warning', scoreImpact: 20 });
        }
    } else {
        // No JD provided logic
        keywordScore += 20;
        feedback.push({ category: 'Keywords', message: 'No job description provided. Score is based on general best practices.', type: 'success', scoreImpact: 20 });
    }

    // --- 4. Writing Quality (15 pts) ---
    // Active voice, cliches, capitalization

    // Simple check for passive voice indicators or weak words
    const weakWords = ['responsible for', 'helped', 'assisted', 'worked on'];
    const resumeStrLower = JSON.stringify(resume).toLowerCase();
    const hasWeakWords = weakWords.some(w => resumeStrLower.includes(w));

    if (!hasWeakWords) {
        writingScore += 15;
        feedback.push({ category: 'Writing', message: 'Strong, active language used throughout.', type: 'success', scoreImpact: 15 });
    } else {
        writingScore += 5;
        feedback.push({ category: 'Writing', message: 'Avoid passive phrases like "Responsible for". Use action verbs like "Managed", "Built", "Led".', type: 'warning', scoreImpact: 5 });
    }

    // --- 5. Application Ready (15 pts) ---
    // Contact info, links, final polish

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
        overallScore: Math.min(100, overallScore), // Cap at 100 just in case
        categoryScores,
        feedback,
        matchedKeywords: matched,
        missingKeywords: missing
    };
}
