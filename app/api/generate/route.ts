import { NextRequest, NextResponse } from 'next/server';
import { generateContentWithFallback } from '@/lib/gemini';
import fs from 'fs';
import path from 'path';
import { getLimiter, COST } from '@/lib/arcjet';
import { generateResumeSchema, safeParseBody } from '@/lib/validations';
import { getEntitlement, PRO_REQUIRED_RESPONSE } from '@/lib/subscription-server';

// A full-resume Gemini call regularly runs past Vercel's 10s default.
export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        // 1. Authentication Check
        const { userId, isPro } = await getEntitlement();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1b. AI optimization is a Pro feature (PRD §7: "Full optimization").
        //     The UI hides this behind an upgrade prompt, but the check has to
        //     live here, the route is reachable directly.
        if (!isPro) {
            return NextResponse.json(PRO_REQUIRED_RESPONSE, { status: 402 });
        }

        // 2. Rate Limiting Check
        const decision = await getLimiter(isPro).protect(request, { userId, requested: COST.aiGenerate });
        if (decision.isDenied()) {
            return NextResponse.json({ error: 'Too Many Requests', reason: decision.reason }, { status: 429 });
        }

        // 3. Safe body parsing (rejects oversized / malformed payloads)
        const bodyResult = await safeParseBody(request);
        if ('error' in bodyResult) return bodyResult.error;

        // 4. Zod validation
        const parsed = generateResumeSchema.safeParse(bodyResult.data);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { resume, stylePrompt, jobDescription } = parsed.data;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Read the system design prompt from the file
        const filePath = path.join(process.cwd(), 'ai', 'system_design_prompt.txt');
        let systemInstructions = '';

        try {
            systemInstructions = fs.readFileSync(filePath, 'utf-8');
        } catch (readError) {
            console.error('Failed to read system prompt file:', readError);
            return NextResponse.json({ error: 'Failed to load AI configuration' }, { status: 500 });
        }

        let jobContext = '';
        if (jobDescription && jobDescription.trim().length > 50) {
            jobContext = `\nTARGET JOB DESCRIPTION:\n${jobDescription}\n`;
        }

        // Construct the final prompt by combining system instructions with user context
        const prompt = `${systemInstructions}

====================
CONTEXT & INPUT
====================

USER STYLE GOAL: "${stylePrompt || 'General Professional'}"
${jobContext}
INPUT RESUME DATA:
${JSON.stringify(resume, null, 2)}

INSTRUCTION OVERRIDE:
The "INPUT RESUME DATA" is the **single source of truth**.
- If it contains data, **PRESERVE IT**. Do not add extra schools or jobs.
- If it is empty, generate a sample.
- **NEVER use "University of Applied Sciences".**
- Return ONLY valid JSON adhering to the schema defined above.
- "refined_content" is REQUIRED. Returning style tokens without rewritten
  content is a failed response.`;

        const data = await generateContentWithFallback(prompt, apiKey, {
            // Low temperature: this is factual copy editing over the user's real
            // history, not creative writing. High values invented details.
            temperature: 0.35,
            maxOutputTokens: 8192,
        });

        let content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
            console.error('Resume optimization: model returned no text');
            return NextResponse.json(
                { error: 'The AI did not return a result. Please try again.' },
                { status: 502 }
            );
        }

        // Clean up the response - remove markdown code blocks if present
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let designEngineOutput: any;
        try {
            designEngineOutput = JSON.parse(content);
        } catch {
            console.error('Resume optimization: model returned non-JSON:', content.slice(0, 500));
            return NextResponse.json(
                { error: 'The AI returned an unreadable result. Please try again.' },
                { status: 502 }
            );
        }

        const refined = designEngineOutput.refined_content || designEngineOutput.minimized_content;

        // Guard against the silent no-op: if the model returns only style tokens,
        // the client would merge nothing but colors and the user sees their
        // content unchanged with a recoloured header. Treat that as a failure.
        const hasUsableContent =
            refined &&
            typeof refined === 'object' &&
            (
                (typeof refined.profile?.summary === 'string' && refined.profile.summary.trim().length > 0) ||
                (Array.isArray(refined.experience) && refined.experience.length > 0) ||
                (Array.isArray(refined.education) && refined.education.length > 0) ||
                (Array.isArray(refined.skills) && refined.skills.length > 0) ||
                (Array.isArray(refined.projects) && refined.projects.length > 0)
            );

        if (!hasUsableContent) {
            console.error(
                'Resume optimization: model returned no usable content. Keys:',
                Object.keys(designEngineOutput || {})
            );
            return NextResponse.json(
                { error: 'The AI could not rewrite this resume. Please try again.' },
                { status: 502 }
            );
        }

        // Style tokens fall back to the user's EXISTING styles, never to a
        // hardcoded theme. Defaulting to 'modern'/blue here is what silently
        // recoloured resumes whose owner had deliberately picked another template.
        const existingStyles = (resume as any)?.customStyles ?? {};
        const tokens = designEngineOutput.style_tokens ?? {};

        const improvedResume = {
            ...refined,
            customStyles: {
                accentColor: tokens.accentColor || existingStyles.accentColor || '#3B82F6',
                primaryColor: tokens.primaryColor || existingStyles.primaryColor || '#111827',
                fontBody: tokens.fontBody || existingStyles.fontBody || 'Open Sans',
                fontHeading: tokens.fontHeading || existingStyles.fontHeading || 'Inter',
                theme: tokens.theme || existingStyles.theme || 'modern',
                headingWeight: tokens.headingWeight || existingStyles.headingWeight || '700',
                bodyWeight: tokens.bodyWeight || existingStyles.bodyWeight || '400',
                sectionDividerStyle: tokens.sectionDividerStyle || existingStyles.sectionDividerStyle || 'solid_line',
                bulletStyle: tokens.bulletStyle || existingStyles.bulletStyle || 'disc',
            },
            designCritique: designEngineOutput.critique ? JSON.stringify(designEngineOutput.critique) : undefined,
        };

        return NextResponse.json({
            success: true,
            resume: improvedResume,
            changesMade: Array.isArray(designEngineOutput.changes_made)
                ? designEngineOutput.changes_made
                : [],
        });

    } catch (error: any) {
        // Full detail stays server-side only.
        console.error('Resume optimization failed:', error);
        return NextResponse.json({
            error: 'Something went wrong optimizing your resume. Please try again.'
        }, { status: 500 });
    }
}
