import { NextRequest, NextResponse } from 'next/server';
import { generateContentWithFallback } from '@/lib/gemini';
import arcjet_client from '@/lib/arcjet';
import { generateCoverLetterSchema, safeParseBody } from '@/lib/validations';
import { getEntitlement, PRO_REQUIRED_RESPONSE } from '@/lib/subscription-server';

export async function POST(request: NextRequest) {
    try {
        const { userId, isPro } = await getEntitlement();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Cover letter generation is Pro-only (PRD §7).
        if (!isPro) {
            return NextResponse.json(PRO_REQUIRED_RESPONSE, { status: 402 });
        }

        const decision = await arcjet_client.protect(request, { userId, requested: 1 });
        if (decision.isDenied()) {
            return NextResponse.json({ error: 'Too Many Requests', reason: decision.reason }, { status: 429 });
        }

        // Safe body parsing (rejects oversized / malformed payloads)
        const bodyResult = await safeParseBody(request);
        if ('error' in bodyResult) return bodyResult.error;

        // Zod validation
        const parsed = generateCoverLetterSchema.safeParse(bodyResult.data);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { resume, jobTitle, company, tone } = parsed.data;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        const today = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }); // e.g., "Thursday, February 5, 2026"

        const prompt = `
        YOU ARE A EXPERT CAREER COACH AND COPYWRITER.
        
        TASK: Write a compelling, professional cover letter for the following candidate applying for a specific role.
        
        CANDIDATE INFO (FROM RESUME):
        Name: ${(resume as any).profile?.fullName || 'Candidate'}
        Email: ${(resume as any).profile?.email || ''}
        Phone: ${(resume as any).profile?.phone || ''}
        Address: ${(resume as any).profile?.location || ''}
        (If any contact info is missing, DO NOT insert placeholders. Just omit it from the header/signature).

        RESUME CONTENT:
        ${JSON.stringify(resume, null, 2)}

        TARGET JOB: ${jobTitle || 'A suitable role'}
        TARGET COMPANY: ${company || 'the hiring company'}
        CURRENT DATE: ${today}

        INSTRUCTIONS:
        1. **OUTPUT ONLY THE BODY PARAGRAPHS**. 
           - DO NOT include the Date.
           - DO NOT include the Recipient details.
           - DO NOT include the "Dear Hiring Manager" greeting.
           - DO NOT include the "Sincerely" sign-off or the candidate's name at the bottom.
           - Just write the 3-4 paragraphs of the letter itself. Integrating the hook, experience, and call to action.

        2. **TONE & STYLE (CRITICAL)**:
           - Write like a **human**, not a robot. 
           - Avoid overused AI phrases like "I am writing to express my enthusiasm", "I am thrilled to apply", or "marketing maven".
           - Be conversational but professional. Use varied sentence structure.
           - Focus on *impact* and *results*, not just listing duties.
           - Keep it concise (under 250 words preferred).

        3. **CRITICAL - NO PLACEHOLDERS**:
           - If you don't know the company name, refer to them as "your team" or "the company".
           - Do not use [Insert Name] or similar brackets.
        
        4. **FORMAT**:
           - Return valid Markdown (paragraphs separated by newlines).
        `;

        const data = await generateContentWithFallback(prompt, apiKey, {
            temperature: 0.7,
            maxOutputTokens: 2048,
        });

        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
            return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
        }

        // Final cleanup to ensure no markdown code blocks
        const cleanContent = content.replace(/```/g, '').trim();

        return NextResponse.json({
            success: true,
            content: cleanContent
        });

    } catch (error: any) {
        // Full detail stays server-side only.
        console.error('Cover letter generation failed:', error);
        return NextResponse.json({
            error: 'Something went wrong generating your cover letter. Please try again.'
        }, { status: 500 });
    }
}
