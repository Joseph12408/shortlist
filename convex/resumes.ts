import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, getCurrentUserQuery } from "./users";

export const create = mutation({
    args: {
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
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) {
            throw new Error("Unauthenticated");
        }

        const resumeId = await ctx.db.insert("resumes", {
            userId: user._id,
            title: args.title,
            profile: args.profile,
            education: args.education,
            experience: args.experience,
            leadership: args.leadership,
            projects: args.projects,
            skills: args.skills,
            customStyles: args.customStyles,
            // Defaults
            atsScore: 0,
        });

        return resumeId;
    },
});

export const update = mutation({
    args: {
        id: v.id("resumes"),
        // We allow partial updates of top-level fields
        title: v.optional(v.string()),
        profile: v.optional(v.object({
            fullName: v.string(),
            email: v.string(),
            phone: v.string(),
            location: v.string(),
            website: v.string(),
            linkedin: v.string(),
            summary: v.string(),
            headline: v.optional(v.string()),
            jobTitle: v.optional(v.string()),
        })),
        education: v.optional(v.array(v.object({
            id: v.string(),
            institution: v.string(),
            degree: v.string(),
            fieldOfStudy: v.string(),
            startDate: v.string(),
            endDate: v.string(),
            current: v.boolean(),
            score: v.optional(v.string()),
        }))),
        experience: v.optional(v.array(v.object({
            id: v.string(),
            company: v.string(),
            title: v.string(),
            location: v.string(),
            startDate: v.string(),
            endDate: v.string(),
            current: v.boolean(),
            description: v.string(),
        }))),
        leadership: v.optional(v.array(v.object({
            id: v.string(),
            company: v.string(),
            title: v.string(),
            location: v.string(),
            startDate: v.string(),
            endDate: v.string(),
            current: v.boolean(),
            description: v.string(),
        }))),
        projects: v.optional(v.array(v.object({
            id: v.string(),
            name: v.string(),
            description: v.string(),
            url: v.string(),
            technologies: v.array(v.string()),
        }))),
        skills: v.optional(v.array(v.object({
            id: v.string(),
            category: v.string(),
            skills: v.array(v.string()),
        }))),
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
        atsScore: v.optional(v.number()),
        designCritique: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthenticated");

        const resume = await ctx.db.get(args.id);
        if (!resume || resume.userId !== user._id) {
            throw new Error("Resume not found or unauthorized");
        }

        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const deleteResume = mutation({
    args: { id: v.id("resumes") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Unauthenticated");

        const resume = await ctx.db.get(args.id);
        if (!resume || resume.userId !== user._id) {
            throw new Error("Resume not found or unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

export const get = query({
    args: { id: v.id("resumes") },
    handler: async (ctx, args) => {
        const user = await getCurrentUserQuery(ctx);
        if (!user) return null; // Or throw

        const resume = await ctx.db.get(args.id);
        if (!resume || resume.userId !== user._id) {
            return null;
        }
        return resume;
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUserQuery(ctx);
        if (!user) return [];

        return await ctx.db
            .query("resumes")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
    },
});
