
import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetterPDF } from '@/lib/resume-renderer/render-cover-letter';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { coverLetter, resume } = body;

        if (!coverLetter || !resume) {
            return NextResponse.json({ error: 'Missing coverLetter or resume data' }, { status: 400 });
        }

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
