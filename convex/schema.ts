import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        picture: v.optional(v.string()),
        clerkId: v.string(),
    }).index("by_clerk_id", ["clerkId"]),

    resumes: defineTable({
        userId: v.id("users"), // Reference to the user document
        title: v.string(),

        profile: v.object({
            fullName: v.string(),
            email: v.string(),
            phone: v.string(),
            location: v.string(),
            website: v.string(),
            linkedin: v.string(),
            summary: v.string(),
            headline: v.optional(v.string()),
            jobTitle: v.optional(v.string()),
        }),

        education: v.array(v.object({
            id: v.string(),
            institution: v.string(),
            degree: v.string(),
            fieldOfStudy: v.string(),
            startDate: v.string(),
            endDate: v.string(),
            current: v.boolean(),
            score: v.optional(v.string()),
        })),

        experience: v.array(v.object({
            id: v.string(),
            company: v.string(),
            title: v.string(),
            location: v.string(),
            startDate: v.string(),
            endDate: v.string(),
            current: v.boolean(),
            description: v.string(),
        })),

        leadership: v.array(v.object({
            id: v.string(),
            company: v.string(),
            title: v.string(),
            location: v.string(),
            startDate: v.string(),
            endDate: v.string(),
            current: v.boolean(),
            description: v.string(),
        })),

        projects: v.array(v.object({
            id: v.string(),
            name: v.string(),
            description: v.string(),
            url: v.string(),
            technologies: v.array(v.string()),
        })),

        skills: v.array(v.object({
            id: v.string(),
            category: v.string(),
            skills: v.array(v.string()),
        })),

        customStyles: v.optional(v.object({
            accentColor: v.string(),
            fontBody: v.string(),
            fontHeading: v.string(),
            theme: v.string(),
            primaryColor: v.optional(v.string()),
            fontPair: v.optional(v.string()),
            headingWeight: v.optional(v.string()),
            bodyWeight: v.optional(v.string()),
            sectionDividerStyle: v.optional(v.string()),
            bulletStyle: v.optional(v.string()),
        })),

        designCritique: v.optional(v.string()),
        atsScore: v.optional(v.number()),

    }).index("by_user", ["userId"]),

    coverLetters: defineTable({
        userId: v.id("users"),
        title: v.string(),
        jobTitle: v.string(),
        company: v.string(),
        recipient: v.string(),
        body: v.string(),
        // Optional link back to the resume this letter was written from.
        resumeId: v.optional(v.id("resumes")),
    }).index("by_user", ["userId"]),

    /**
     * One row per job-description scan. Doubles as the counter source for the
     * free-tier monthly scan limit, so it must be written server-side only.
     */
    jobScans: defineTable({
        userId: v.id("users"),
        resumeId: v.optional(v.id("resumes")),
        // Truncated JD text, enough to show scan history without storing
        // an unbounded blob per scan.
        jobDescriptionPreview: v.string(),
        // SHA-256 of the full JD, so re-analysing the same posting (e.g. after
        // editing the resume) doesn't burn a second scan from the quota.
        jobDescriptionHash: v.string(),
        atsScore: v.number(),
        matchedKeywords: v.array(v.string()),
        missingKeywords: v.array(v.string()),
        // "YYYY-MM", indexed so the monthly quota check is a cheap lookup.
        period: v.string(),
    })
        .index("by_user", ["userId"])
        .index("by_user_period", ["userId", "period"]),

    /**
     * One row per completed AI review, powering the "AI Reviews" history page.
     *
     * Distinct from jobScans: that table exists to meter the free-tier quota,
     * this one exists so a user can look back at what a past review said.
     */
    analyses: defineTable({
        userId: v.id("users"),
        resumeId: v.optional(v.id("resumes")),
        // Snapshot of the resume title at review time, so renaming or deleting
        // the resume later does not corrupt the history entry.
        resumeTitle: v.string(),
        overallScore: v.number(),
        categoryScores: v.array(
            v.object({
                name: v.string(),
                score: v.number(),
                maxScore: v.number(),
            })
        ),
        issueCounts: v.object({
            errors: v.number(),
            warnings: v.number(),
            successes: v.number(),
        }),
        // Full feedback snapshot so the stored review renders exactly like the
        // live analysis did, including the Pro-only detail and solution copy.
        feedback: v.array(
            v.object({
                category: v.string(),
                message: v.string(),
                detail: v.optional(v.string()),
                solution: v.optional(v.string()),
                type: v.string(),
                scoreImpact: v.number(),
            })
        ),
        // Present only when the review was run against a job description.
        jobDescriptionPreview: v.optional(v.string()),
        missingKeywords: v.array(v.string()),
    }).index("by_user", ["userId"]),

    /**
     * Monthly usage counters for quota enforcement. One row per user per period.
     */
    usage: defineTable({
        userId: v.id("users"),
        period: v.string(), // "YYYY-MM"
        exportCount: v.number(),
    }).index("by_user_period", ["userId", "period"]),
});
