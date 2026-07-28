import { z } from "zod";

// ── /api/parse ──────────────────────────────────────────────
export const parseResumeSchema = z.object({
    text: z
        .string({ required_error: "Resume text is required" })
        .min(20, "Resume text is too short")
        .max(50_000, "Resume text exceeds 50,000 character limit"),
});

// ── /api/generate ───────────────────────────────────────────
export const generateResumeSchema = z.object({
    resume: z.record(z.unknown()).refine((v) => v !== null, {
        message: "Resume data is required",
    }),
    stylePrompt: z
        .string()
        .max(500, "Style prompt exceeds 500 character limit")
        .optional()
        .default("General Professional"),
    jobDescription: z
        .string()
        .max(10_000, "Job description exceeds 10,000 character limit")
        .optional()
        .default(""),
});

// ── /api/generate-cover-letter ──────────────────────────────
export const generateCoverLetterSchema = z.object({
    resume: z.record(z.unknown()).refine((v) => v !== null, {
        message: "Resume data is required",
    }),
    jobTitle: z
        .string()
        .max(200, "Job title exceeds 200 character limit")
        .optional()
        .default("A suitable role"),
    company: z
        .string()
        .max(200, "Company name exceeds 200 character limit")
        .optional()
        .default("the hiring company"),
    tone: z
        .string()
        .max(100, "Tone exceeds 100 character limit")
        .optional(),
});

// ── /api/download-pdf ───────────────────────────────────────
export const downloadPdfSchema = z.object({
    resume: z
        .record(z.unknown())
        .refine((v) => v !== null, { message: "Resume data is required" })
        .optional(),
    profile: z.record(z.unknown()).optional(),
}).refine(
    (data) => data.resume !== undefined || data.profile !== undefined,
    { message: "Resume data or profile is required" }
);

// ── /api/download-cover-letter ──────────────────────────────
export const downloadCoverLetterSchema = z.object({
    coverLetter: z.record(z.unknown()).refine((v) => v !== null, {
        message: "Cover letter data is required",
    }),
    resume: z.record(z.unknown()).refine((v) => v !== null, {
        message: "Resume data is required",
    }),
});

// ── /api/job-scan ───────────────────────────────────────────
export const jobScanSchema = z.object({
    jobDescription: z
        .string()
        .min(50, "Job description is too short to scan")
        .max(10_000, "Job description exceeds 10,000 character limit"),
    atsScore: z.number().min(0).max(100),
    matchedKeywords: z.array(z.string().max(120)).max(100).default([]),
    missingKeywords: z.array(z.string().max(120)).max(100).default([]),
    resumeId: z.string().max(100).optional(),
});

// ── Helpers ─────────────────────────────────────────────────

/** Max allowed request body size in bytes (2 MB) */
export const MAX_BODY_SIZE = 2 * 1024 * 1024;

/**
 * Safely parse a JSON request body.
 * Returns an error Response if the body is too large or malformed.
 */
export async function safeParseBody(
    request: Request
): Promise<{ data: unknown } | { error: Response }> {
    // Check Content-Length header first (fast reject)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
        return {
            error: new Response(
                JSON.stringify({ error: "Payload too large (max 2 MB)" }),
                { status: 413, headers: { "Content-Type": "application/json" } }
            ),
        };
    }

    try {
        const text = await request.text();

        // Double-check actual size
        if (text.length > MAX_BODY_SIZE) {
            return {
                error: new Response(
                    JSON.stringify({ error: "Payload too large (max 2 MB)" }),
                    { status: 413, headers: { "Content-Type": "application/json" } }
                ),
            };
        }

        const data = JSON.parse(text);
        return { data };
    } catch {
        return {
            error: new Response(
                JSON.stringify({ error: "Invalid or malformed JSON body" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            ),
        };
    }
}
