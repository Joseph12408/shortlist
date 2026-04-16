"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = exports.get = exports.deleteResume = exports.update = exports.create = void 0;
const values_1 = require("convex/values");
const server_1 = require("./_generated/server");
const users_1 = require("./users");
exports.create = (0, server_1.mutation)({
    args: {
        title: values_1.v.string(),
        profile: values_1.v.object({
            fullName: values_1.v.string(),
            email: values_1.v.string(),
            phone: values_1.v.string(),
            location: values_1.v.string(),
            website: values_1.v.string(),
            linkedin: values_1.v.string(),
            summary: values_1.v.string(),
            headline: values_1.v.optional(values_1.v.string()),
            jobTitle: values_1.v.optional(values_1.v.string()),
        }),
        education: values_1.v.array(values_1.v.object({
            id: values_1.v.string(),
            institution: values_1.v.string(),
            degree: values_1.v.string(),
            fieldOfStudy: values_1.v.string(),
            startDate: values_1.v.string(),
            endDate: values_1.v.string(),
            current: values_1.v.boolean(),
            score: values_1.v.optional(values_1.v.string()),
        })),
        experience: values_1.v.array(values_1.v.object({
            id: values_1.v.string(),
            company: values_1.v.string(),
            title: values_1.v.string(),
            location: values_1.v.string(),
            startDate: values_1.v.string(),
            endDate: values_1.v.string(),
            current: values_1.v.boolean(),
            description: values_1.v.string(),
        })),
        leadership: values_1.v.array(values_1.v.object({
            id: values_1.v.string(),
            company: values_1.v.string(),
            title: values_1.v.string(),
            location: values_1.v.string(),
            startDate: values_1.v.string(),
            endDate: values_1.v.string(),
            current: values_1.v.boolean(),
            description: values_1.v.string(),
        })),
        projects: values_1.v.array(values_1.v.object({
            id: values_1.v.string(),
            name: values_1.v.string(),
            description: values_1.v.string(),
            url: values_1.v.string(),
            technologies: values_1.v.array(values_1.v.string()),
        })),
        skills: values_1.v.array(values_1.v.object({
            id: values_1.v.string(),
            category: values_1.v.string(),
            skills: values_1.v.array(values_1.v.string()),
        })),
        customStyles: values_1.v.optional(values_1.v.object({
            accentColor: values_1.v.string(),
            fontBody: values_1.v.string(),
            fontHeading: values_1.v.string(),
            theme: values_1.v.string(),
            primaryColor: values_1.v.optional(values_1.v.string()),
            fontPair: values_1.v.optional(values_1.v.string()),
            headingWeight: values_1.v.optional(values_1.v.string()),
            bodyWeight: values_1.v.optional(values_1.v.string()),
            sectionDividerStyle: values_1.v.optional(values_1.v.string()),
            bulletStyle: values_1.v.optional(values_1.v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const user = await (0, users_1.getCurrentUser)(ctx);
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
exports.update = (0, server_1.mutation)({
    args: {
        id: values_1.v.id("resumes"),
        // We allow partial updates of top-level fields
        title: values_1.v.optional(values_1.v.string()),
        profile: values_1.v.optional(values_1.v.object({
            fullName: values_1.v.string(),
            email: values_1.v.string(),
            phone: values_1.v.string(),
            location: values_1.v.string(),
            website: values_1.v.string(),
            linkedin: values_1.v.string(),
            summary: values_1.v.string(),
            headline: values_1.v.optional(values_1.v.string()),
            jobTitle: values_1.v.optional(values_1.v.string()),
        })),
        education: values_1.v.optional(values_1.v.array(values_1.v.object({
            id: values_1.v.string(),
            institution: values_1.v.string(),
            degree: values_1.v.string(),
            fieldOfStudy: values_1.v.string(),
            startDate: values_1.v.string(),
            endDate: values_1.v.string(),
            current: values_1.v.boolean(),
            score: values_1.v.optional(values_1.v.string()),
        }))),
        experience: values_1.v.optional(values_1.v.array(values_1.v.object({
            id: values_1.v.string(),
            company: values_1.v.string(),
            title: values_1.v.string(),
            location: values_1.v.string(),
            startDate: values_1.v.string(),
            endDate: values_1.v.string(),
            current: values_1.v.boolean(),
            description: values_1.v.string(),
        }))),
        leadership: values_1.v.optional(values_1.v.array(values_1.v.object({
            id: values_1.v.string(),
            company: values_1.v.string(),
            title: values_1.v.string(),
            location: values_1.v.string(),
            startDate: values_1.v.string(),
            endDate: values_1.v.string(),
            current: values_1.v.boolean(),
            description: values_1.v.string(),
        }))),
        projects: values_1.v.optional(values_1.v.array(values_1.v.object({
            id: values_1.v.string(),
            name: values_1.v.string(),
            description: values_1.v.string(),
            url: values_1.v.string(),
            technologies: values_1.v.array(values_1.v.string()),
        }))),
        skills: values_1.v.optional(values_1.v.array(values_1.v.object({
            id: values_1.v.string(),
            category: values_1.v.string(),
            skills: values_1.v.array(values_1.v.string()),
        }))),
        customStyles: values_1.v.optional(values_1.v.object({
            accentColor: values_1.v.string(),
            fontBody: values_1.v.string(),
            fontHeading: values_1.v.string(),
            theme: values_1.v.string(),
            primaryColor: values_1.v.optional(values_1.v.string()),
            fontPair: values_1.v.optional(values_1.v.string()),
            headingWeight: values_1.v.optional(values_1.v.string()),
            bodyWeight: values_1.v.optional(values_1.v.string()),
            sectionDividerStyle: values_1.v.optional(values_1.v.string()),
            bulletStyle: values_1.v.optional(values_1.v.string()),
        })),
        atsScore: values_1.v.optional(values_1.v.number()),
        designCritique: values_1.v.optional(values_1.v.string()),
    },
    handler: async (ctx, args) => {
        const user = await (0, users_1.getCurrentUser)(ctx);
        if (!user)
            throw new Error("Unauthenticated");
        const resume = await ctx.db.get(args.id);
        if (!resume || resume.userId !== user._id) {
            throw new Error("Resume not found or unauthorized");
        }
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});
exports.deleteResume = (0, server_1.mutation)({
    args: { id: values_1.v.id("resumes") },
    handler: async (ctx, args) => {
        const user = await (0, users_1.getCurrentUser)(ctx);
        if (!user)
            throw new Error("Unauthenticated");
        const resume = await ctx.db.get(args.id);
        if (!resume || resume.userId !== user._id) {
            throw new Error("Resume not found or unauthorized");
        }
        await ctx.db.delete(args.id);
    },
});
exports.get = (0, server_1.query)({
    args: { id: values_1.v.id("resumes") },
    handler: async (ctx, args) => {
        const user = await (0, users_1.getCurrentUserQuery)(ctx);
        if (!user)
            return null; // Or throw
        const resume = await ctx.db.get(args.id);
        if (!resume || resume.userId !== user._id) {
            return null;
        }
        return resume;
    },
});
exports.list = (0, server_1.query)({
    args: {},
    handler: async (ctx) => {
        const user = await (0, users_1.getCurrentUserQuery)(ctx);
        if (!user)
            return [];
        return await ctx.db
            .query("resumes")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
    },
});
