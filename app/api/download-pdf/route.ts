import { NextRequest, NextResponse } from 'next/server';
import { generatePDF } from '@/lib/resume-renderer/render';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const resumeData = await request.json();

        if (!resumeData) {
            console.error("❌ PDF Generation: No resume data provided");
            return NextResponse.json({ error: 'Resume data required' }, { status: 400 });
        }

        console.log("📄 PDF Generation Request received for:", resumeData.profile?.fullName);
        const pdfBuffer = await generatePDF(resumeData);
        console.log("✅ PDF Generation successful, buffer size:", pdfBuffer.length);

        // @ts-ignore - Buffer is compatible with BodyInit in Next.js/Node but types might conflict
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="resume.pdf"`,
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
