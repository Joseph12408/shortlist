import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import arcjet_client from '@/lib/arcjet';
import { safeParseBody } from '@/lib/validations';
import { jobScanSchema } from '@/lib/validations';
import { getEntitlement } from '@/lib/subscription-server';
import { getServerConvexClient } from '@/lib/convex-server';
import { api } from '@/convex/_generated/api';
import { FREE_MONTHLY_JOB_SCANS } from '@/lib/tiers';

/**
 * Meters job-description scans.
 *
 * Free users get FREE_MONTHLY_JOB_SCANS distinct job descriptions per calendar
 * month (PRD §7 "limited job scan"); Pro is unlimited. Re-scanning a JD already
 * used this month is always free so users can iterate on a resume against the
 * same posting.
 */
export async function POST(request: NextRequest) {
    try {
        const { userId, isPro } = await getEntitlement();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decision = await arcjet_client.protect(request, { userId, requested: 1 });
        if (decision.isDenied()) {
            return NextResponse.json({ error: 'Too Many Requests', reason: decision.reason }, { status: 429 });
        }

        const bodyResult = await safeParseBody(request);
        if ('error' in bodyResult) return bodyResult.error;

        const parsed = jobScanSchema.safeParse(bodyResult.data);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { jobDescription, atsScore, matchedKeywords, missingKeywords, resumeId } = parsed.data;

        const convex = await getServerConvexClient();
        if (!convex) {
            return NextResponse.json(
                { error: 'quota_unavailable', message: 'Could not verify your scan quota. Please sign in again.' },
                { status: 503 }
            );
        }

        const jobDescriptionHash = crypto
            .createHash('sha256')
            .update(jobDescription.trim().toLowerCase())
            .digest('hex');

        // Free users: block once the monthly allowance is spent, unless this is
        // a JD they already scanned this period.
        if (!isPro) {
            const [used, alreadyScanned] = await Promise.all([
                convex.query(api.usage.jobScansThisPeriod, {}),
                convex.query(api.usage.hasScannedHash, { jobDescriptionHash }),
            ]);

            if (!alreadyScanned && used >= FREE_MONTHLY_JOB_SCANS) {
                return NextResponse.json(
                    {
                        error: 'scan_limit_reached',
                        message: `Free plan includes ${FREE_MONTHLY_JOB_SCANS} job scans per month. Upgrade to Pro for unlimited scans.`,
                        used,
                        limit: FREE_MONTHLY_JOB_SCANS,
                    },
                    { status: 402 }
                );
            }
        }

        const result = await convex.mutation(api.usage.recordJobScan, {
            jobDescriptionPreview: jobDescription.slice(0, 500),
            jobDescriptionHash,
            atsScore,
            matchedKeywords,
            missingKeywords,
            resumeId: resumeId as any,
        });

        return NextResponse.json({
            success: true,
            used: result.used,
            limit: isPro ? null : FREE_MONTHLY_JOB_SCANS,
            isPro,
        });
    } catch (error: any) {
        // Full detail stays server-side only.
        console.error('[JOB SCAN] Error:', error);
        return NextResponse.json(
            { error: 'Something went wrong recording your scan. Please try again.' },
            { status: 500 }
        );
    }
}

/** Current scan usage, for rendering the remaining-scans hint. */
export async function GET() {
    try {
        const { userId, isPro } = await getEntitlement();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const convex = await getServerConvexClient();
        if (!convex) {
            return NextResponse.json({ used: 0, limit: isPro ? null : FREE_MONTHLY_JOB_SCANS, isPro });
        }

        const used = await convex.query(api.usage.jobScansThisPeriod, {});
        return NextResponse.json({
            used,
            limit: isPro ? null : FREE_MONTHLY_JOB_SCANS,
            isPro,
        });
    } catch (error: any) {
        console.error('[JOB SCAN] Usage lookup failed:', error);
        return NextResponse.json({ error: 'Failed to read scan usage' }, { status: 500 });
    }
}
