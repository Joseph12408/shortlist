"use client";

import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function AnalysisPreview() {
    const ref = useRef(null);
    // Trigger when 60% of the component is visible in the viewport
    const isInView = useInView(ref, { amount: 0.6, margin: "0px 0px -100px 0px" });

    // Animation state - Slower spring (lower stiffness, higher damping)
    const score = useSpring(65, { stiffness: 15, damping: 20, mass: 1.5 });
    const roundedScore = useTransform(score, (value) => Math.round(value));
    const [displayScore, setDisplayScore] = useState(65);

    useEffect(() => {
        if (isInView) {
            score.set(92);
        } else {
            score.set(65);
        }
    }, [isInView, score]);

    useEffect(() => {
        return roundedScore.on("change", (latest) => {
            setDisplayScore(latest);
        });
    }, [roundedScore]);

    // Determine color based on score (Yellow < 80, Green >= 80)
    const isPassing = displayScore >= 80;
    const scoreColorClass = isPassing ? "text-green-600 bg-green-50 border-green-500" : "text-yellow-600 bg-yellow-50 border-yellow-500";
    const textColorClass = isPassing ? "text-green-900" : "text-yellow-900"; // For dark mode fallback/text

    return (
        <section id="analysis" className="py-24 bg-background overflow-hidden relative">
            <div className="container px-6 mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Left: Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
                            See what the ATS sees, <br className="hidden lg:block" />
                            <span className="text-primary">before you apply.</span>
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Upload your resume and get an instant score based on industry standards. We'll show you exactly what's missing and how to fix it.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <Button size="lg" className="h-12 px-8 gap-2" asChild>
                                <Link href="/builder">
                                    <Upload className="w-4 h-4" />
                                    Upload Resume
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right: Analysis Visual Preview */}
                    <div className="flex-1 w-full max-w-xl relative" ref={ref}>
                        {/* Decorative blobs */}
                        <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10" />
                        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10" />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.6 }}
                            className="bg-white dark:bg-slate-900 border rounded-2xl shadow-2xl p-6 md:p-8 relative"
                        >
                            {/* Score Header */}
                            <div className="flex items-center justify-between mb-8 border-b pb-6">
                                <div>
                                    <div className="text-sm font-medium text-slate-500 mb-1">Overall Score</div>
                                    <div className="text-3xl font-bold text-slate-900 dark:text-white flex items-end gap-1">
                                        {displayScore}
                                        <span className="text-slate-400 text-lg mb-1">/100</span>
                                    </div>
                                </div>
                                <motion.div
                                    className={`h-16 w-16 rounded-full border-[4px] flex items-center justify-center font-bold text-xl transition-colors duration-500 ${scoreColorClass}`}
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.5, delay: 1.5 }} // Pulse when done
                                >
                                    {displayScore}
                                </motion.div>
                            </div>

                            {/* Analysis Items */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="font-semibold text-green-900 dark:text-green-100 text-sm">Contact Information</div>
                                        <div className="text-xs text-green-700 dark:text-green-300 mt-1">Email and phone number properly detected.</div>
                                    </div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 1 }}
                                    animate={isInView ? { opacity: 0.5, filter: "grayscale(100%)" } : {}}
                                    transition={{ delay: 2, duration: 0.5 }} // Fade out error as if fixed
                                    className="flex items-start gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="font-semibold text-red-900 dark:text-red-100 text-sm">Missing Keywords</div>
                                        <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                                            Missing: "Project Management", "Agile", "TypeScript".
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={isInView ? { opacity: 1, height: "auto" } : {}}
                                    transition={{ delay: 2.2, duration: 0.5 }}
                                    className="flex items-start gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 overflow-hidden"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="font-semibold text-green-900 dark:text-green-100 text-sm">Keywords Optimized</div>
                                        <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                                            Added: "Agile Leadership", "TypeScript Expert".
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Floating "Fix it" badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, right: -20 }}
                                animate={isInView ? { opacity: 1, scale: 1, right: -16 } : {}}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="absolute top-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg"
                            >
                                <motion.span
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    AI Optimizing...
                                </motion.span>
                            </motion.div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
