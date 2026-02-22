"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("convex/server");
const values_1 = require("convex/values");
exports.default = (0, server_1.defineSchema)({
    users: (0, server_1.defineTable)({
        name: values_1.v.string(),
        email: values_1.v.string(),
        picture: values_1.v.optional(values_1.v.string()),
        clerkId: values_1.v.string(),
    }).index("by_clerk_id", ["clerkId"]),
    resumes: (0, server_1.defineTable)({
        userId: values_1.v.id("users"), // Reference to the user document
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
        designCritique: values_1.v.optional(values_1.v.string()),
        atsScore: values_1.v.optional(values_1.v.number()),
    }).index("by_user", ["userId"]),
});
