
import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetterPDF } from '@/lib/resume-renderer/render-cover-letter';
import { auth } from '@clerk/nextjs/server';
import arcjet_client from '@/lib/arcjet';
import { downloadCoverLetterSchema, safeParseBody } from '@/lib/validations';

export async function POST(req: NextRequest) {
    try {
        // 1. Authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Rate Limiting
        const decision = await arcjet_client.protect(req, { userId });
        if (decision.isDenied()) {
            return NextResponse.json({ error: 'Too Many Requests', reason: decision.reason }, { status: 429 });
        }

        // 3. Safe body parsing (rejects oversized / malformed payloads)
        const bodyResult = await safeParseBody(req);
        if ('error' in bodyResult) return bodyResult.error;

        // 4. Zod validation
        const parsed = downloadCoverLetterSchema.safeParse(bodyResult.data);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { coverLetter, resume } = parsed.data;

        const pdfBuffer = await generateCoverLetterPDF(coverLetter, resume);

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="cover-letter.pdf"`,
            },
        });

    } catch (error: any) {
        console.error('Error generating Cover Letter PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF', details: error.message },
            { status: 500 }
        );
    }
}
