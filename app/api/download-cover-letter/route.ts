
import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetterPDF } from '@/lib/resume-renderer/render-cover-letter';
import arcjet_client from '@/lib/arcjet';
import { downloadCoverLetterSchema, safeParseBody } from '@/lib/validations';
import { getEntitlement, PRO_REQUIRED_RESPONSE } from '@/lib/subscription-server';

export async function POST(req: NextRequest) {
    try {
        // 1. Authentication
        const { userId, isPro } = await getEntitlement();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Cover letter export is Pro-only (PRD §7: "resume + cover letter export").
        if (!isPro) {
            return NextResponse.json(PRO_REQUIRED_RESPONSE, { status: 402 });
        }

        // 2. Rate Limiting
        const decision = await arcjet_client.protect(req, { userId, requested: 1 });
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
        // Full detail stays server-side only.
        console.error('Cover letter PDF generation failed:', error);
        return NextResponse.json(
            { error: 'Something went wrong generating your cover letter PDF. Please try again.' },
            { status: 500 }
        );
    }
}
