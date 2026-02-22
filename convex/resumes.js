"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = exports.get = exports.deleteResume = exports.update = exports.create = void 0;
const values_1 = require("convex/values");
const server_1 = require("./_generated/server");
const users_1 = require("./users");
exports.create = (0, server_1.mutation)({
    args: {
        title: values_1.v.string(),
        profile: values_1.v.any(), // Using any for initial flexibility, but schema enforces structure on insert
        education: values_1.v.array(values_1.v.any()),
        experience: values_1.v.array(values_1.v.any()),
        leadership: values_1.v.array(values_1.v.any()),
        projects: values_1.v.array(values_1.v.any()),
        skills: values_1.v.array(values_1.v.any()),
        customStyles: values_1.v.optional(values_1.v.any()),
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
        profile: values_1.v.optional(values_1.v.any()),
        education: values_1.v.optional(values_1.v.array(values_1.v.any())),
        experience: values_1.v.optional(values_1.v.array(values_1.v.any())),
        leadership: values_1.v.optional(values_1.v.array(values_1.v.any())),
        projects: values_1.v.optional(values_1.v.array(values_1.v.any())),
        skills: values_1.v.optional(values_1.v.array(values_1.v.any())),
        customStyles: values_1.v.optional(values_1.v.any()),
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
