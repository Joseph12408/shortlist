"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    providers: [
        {
            domain: process.env.CLERK_ISSUER_URL,
            applicationID: "convex",
        },
    ],
};
