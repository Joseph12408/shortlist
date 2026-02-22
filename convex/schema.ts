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
});
