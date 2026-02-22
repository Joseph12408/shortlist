import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import arcjet_client from '@/lib/arcjet';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decision = await arcjet_client.protect(request, { userId });
        if (decision.isDenied()) {
            return NextResponse.json({ error: 'Too Many Requests', reason: decision.reason }, { status: 429 });
        }

        const { resume, jobTitle, company, tone } = await request.json();

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
        Name: ${resume.profile?.fullName || 'Candidate'}
        Email: ${resume.profile?.email || ''}
        Phone: ${resume.profile?.phone || ''}
        Address: ${resume.profile?.location || ''}
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

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    }
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error('Gemini API Error:', data.error);
            return NextResponse.json({ error: data.error.message }, { status: 500 });
        }

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
        console.error('Cover Letter Gen Error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to generate cover letter'
        }, { status: 500 });
    }
}
