import { NextRequest, NextResponse } from 'next/server';
import { generateContentWithFallback } from '@/lib/gemini';
import fs from 'fs';
import path from 'path';
import { auth } from '@clerk/nextjs/server';
import arcjet_client from '@/lib/arcjet';

export async function POST(request: NextRequest) {
    try {
        // 1. Authentication Check
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Rate Limiting Check
        const decision = await arcjet_client.protect(request, { userId });
        if (decision.isDenied()) {
            return NextResponse.json({ error: 'Too Many Requests', reason: decision.reason }, { status: 429 });
        }

        const { resume, stylePrompt, jobDescription } = await request.json();

        if (!resume) {
            return NextResponse.json({ error: 'Resume data required' }, { status: 400 });
        }

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
- Return ONLY valid JSON adhering to the schema defined above.`;

        const data = await generateContentWithFallback(prompt, apiKey, {
            temperature: 0.7,
            maxOutputTokens: 8192,
        });

        let content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
            return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
        }

        // Clean up the response - remove markdown code blocks if present
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const designEngineOutput = JSON.parse(content);

        // Map Design Engine output to our internal Resume structure
        const improvedResume = {
            ...(designEngineOutput.refined_content || designEngineOutput.minimized_content || {}),
            customStyles: {
                accentColor: designEngineOutput.style_tokens?.accentColor || '#3B82F6',
                primaryColor: designEngineOutput.style_tokens?.primaryColor || '#111827',
                fontBody: designEngineOutput.style_tokens?.fontBody || 'Open Sans',
                fontHeading: designEngineOutput.style_tokens?.fontHeading || 'Inter',
                theme: designEngineOutput.style_tokens?.theme || 'modern',
                headingWeight: designEngineOutput.style_tokens?.headingWeight || '700',
                bodyWeight: designEngineOutput.style_tokens?.bodyWeight || '400',
                sectionDividerStyle: designEngineOutput.style_tokens?.sectionDividerStyle || 'solid_line',
                bulletStyle: designEngineOutput.style_tokens?.bulletStyle || 'disc'
            },
            designCritique: designEngineOutput.critique ? JSON.stringify(designEngineOutput.critique) : undefined
        };

        return NextResponse.json({
            success: true,
            resume: improvedResume
        });

    } catch (error: any) {
        console.error('Gemini API Error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to generate resume'
        }, { status: 500 });
    }
}
