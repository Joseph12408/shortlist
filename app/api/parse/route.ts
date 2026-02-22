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

        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Resume text required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        const prompt = `
You are an expert Resume Parser. Your job is to extract structured data from the provided resume text and return it as a JSON object adhering to the following schema.

SCHEMA:
interface Resume {
    profile: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
        website: string;
        linkedin: string;
        summary: string;
    };
    education: {
        id: string; // generate a unique string
        institution: string;
        degree: string;
        fieldOfStudy: string;
        startDate: string;
        endDate: string;
        current: boolean;
        score: string;
    }[];
    experience: {
        id: string; // generate a unique string
        company: string;
        title: string;
        location: string;
        startDate: string;
        endDate: string;
        current: boolean;
        description: string;
    }[];
    projects: {
        id: string; // generate a unique string
        name: string;
        description: string;
        url: string;
        technologies: string[];
    }[];
    skills: {
        id: string; // generate a unique string
        category: string;
        skills: string[];
    }[];
}

INSTRUCTIONS:
1. Extract as much information as possible from the text.
2. infer missing fields where possible (e.g. if a date is "Present", current is true).
3. Do not include markdown formatting in the response (no \`\`\`json).
4. Return ONLY the JSON object.

RESUME TEXT:
${text}
`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.1, // Low temperature for extraction accuracy
                        maxOutputTokens: 8192,
                    }
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error('Gemini API Error:', data.error);
            return NextResponse.json({ error: data.error.message }, { status: 500 });
        }

        let content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
            return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
        }

        // Clean up response
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsedResume = JSON.parse(content);

        return NextResponse.json({
            success: true,
            resume: parsedResume
        });

    } catch (error: any) {
        console.error('Parse API Error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to parse resume'
        }, { status: 500 });
    }
}
