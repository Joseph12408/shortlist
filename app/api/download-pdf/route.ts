import { NextRequest, NextResponse } from 'next/server';
import { generatePDF } from '@/lib/resume-renderer/render';
import { getLimiter, COST } from '@/lib/arcjet';
import { safeParseBody } from '@/lib/validations';
import { getEntitlement } from '@/lib/subscription-server';
import { getServerConvexClient } from '@/lib/convex-server';
import { api } from '@/convex/_generated/api';
import { FREE_MONTHLY_EXPORTS } from '@/lib/tiers';

const GENERIC_EXPORT_ERROR = 'Something went wrong generating your PDF. Please try again.';

// Launching headless Chromium costs several seconds before rendering even
// starts, which blows through Vercel's 10s default.
export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        // 1. Authentication + entitlement
        const { userId, isPro } = await getEntitlement();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Rate Limiting
        const decision = await getLimiter(isPro).protect(request, { userId, requested: COST.pdfExport });
        if (decision.isDenied()) {
            return NextResponse.json({ error: 'Too Many Requests', reason: decision.reason }, { status: 429 });
        }

        // 3. Safe body parsing (rejects oversized / malformed payloads)
        const bodyResult = await safeParseBody(request);
        if ('error' in bodyResult) return bodyResult.error;

        const body = bodyResult.data as any;
        const resumeData = body.resume || body;

        if (!resumeData || !resumeData.profile) {
            console.error("PDF Generation: no resume data provided");
            return NextResponse.json({ error: 'Resume data required' }, { status: 400 });
        }

        // 4. Free-tier quota. Pro is unlimited and unwatermarked, and never
        //    touches Convex here at all. Export must not depend on a service
        //    Pro users have no functional need for.
        let convex = null;

        if (!isPro) {
            convex = await getServerConvexClient();

            if (!convex) {
                // Without a Convex identity the quota cannot be enforced, so
                // fail closed rather than hand out unlimited free exports.
                return NextResponse.json(
                    { error: 'quota_unavailable', message: 'Could not verify your export quota. Please try signing in again.' },
                    { status: 503 }
                );
            }

            const used = await convex.query(api.usage.exportsThisPeriod, {});
            if (used >= FREE_MONTHLY_EXPORTS) {
                return NextResponse.json(
                    {
                        error: 'usage_limit_reached',
                        message: `Free plan is limited to ${FREE_MONTHLY_EXPORTS} exports per month. Upgrade to Pro for unlimited, watermark-free exports.`,
                        used,
                        limit: FREE_MONTHLY_EXPORTS,
                    },
                    { status: 402 }
                );
            }
        }

        const pdfBuffer = await generatePDF(resumeData, { watermark: !isPro });

        if (!pdfBuffer || pdfBuffer.length === 0) {
            console.error("PDF Generation: buffer is empty");
            return NextResponse.json({ error: GENERIC_EXPORT_ERROR }, { status: 500 });
        }

        // 5. Only burn quota once the render actually succeeded.
        if (!isPro && convex) {
            try {
                await convex.mutation(api.usage.recordExport, {});
            } catch (e) {
                console.error('[EXPORT] Failed to record export usage:', e);
            }
        }

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="resume.pdf"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });

    } catch (error: any) {
        // Full detail stays server-side. The client only ever sees a generic,
        // user-safe message, never the raw error (stack traces, internal
        // library messages, Clerk/Convex error text, etc. are not for users).
        console.error('PDF download failed:', error);
        return NextResponse.json({ error: GENERIC_EXPORT_ERROR }, { status: 500 });
    }
}
