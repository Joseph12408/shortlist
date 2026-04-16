import { NextRequest, NextResponse } from 'next/server';
import { generatePDF } from '@/lib/resume-renderer/render';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const resumeData = body.resume || body;

        if (!resumeData || !resumeData.profile) {
            console.error("❌ PDF Generation: No resume data provided");
            return NextResponse.json({ error: 'Resume data required' }, { status: 400 });
        }

        console.log("📄 PDF Generation Request received for:", resumeData.profile?.fullName);
        const pdfBuffer = await generatePDF(resumeData);
        
        if (!pdfBuffer || pdfBuffer.length === 0) {
            console.error("❌ PDF Generation: Buffer is empty");
            return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
        }

        console.log("✅ PDF Generation successful, buffer size:", pdfBuffer.length);

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="resume.pdf"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });

    } catch (error: any) {
        console.error('❌ PDF Download Logic Error:', error);
        console.error('Stack:', error.stack);
        return NextResponse.json({
            error: error.message || 'Failed to generate PDF',
            details: error.toString()
        }, { status: 500 });
    }
}
