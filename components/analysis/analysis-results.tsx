"use client";

import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Lock,
    Lightbulb,
    Crown,
} from "lucide-react";
import { prioritizeFeedback, ATSFeedback } from "@/lib/ats/ats-score";
import { FREE_VISIBLE_ISSUES } from "@/lib/tiers";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { useRouter } from "next/navigation";

export interface AnalysisCategory {
    name: string;
    score: number;
    maxScore: number;
}

export interface AnalysisResultsData {
    title: string;
    /** Shown under the title, e.g. "Last updated just now" or a real date. */
    subtitle?: string;
    overallScore: number;
    categories: AnalysisCategory[];
    feedback: ATSFeedback[];
    missingKeywords: string[];
}

interface AnalysisResultsProps {
    data: AnalysisResultsData;
    /** Opens this resume in the builder. Omitted when the resume is gone. */
    onOptimize?: () => void;
    /** Secondary action, e.g. "Upload New" live, "Run New Review" from history. */
    secondaryAction?: { label: string; onClick: () => void };
}

/**
 * Renders a resume analysis.
 *
 * Shared deliberately between the live analysis page and the stored review
 * detail page so a saved review looks exactly like it did when it was run.
 * Feedback depth is tiered here, in one place, so free and Pro behaviour
 * cannot drift between the two surfaces.
 */
export function AnalysisResults({ data, onOptimize, secondaryAction }: AnalysisResultsProps) {
    const { isPro } = useFeatureAccess();
    const router = useRouter();

    const { title, subtitle, overallScore, categories, feedback, missingKeywords } = data;

    const visibleFeedback = isPro
        ? feedback
        : prioritizeFeedback(feedback).slice(0, FREE_VISIBLE_ISSUES);
    const hiddenCount = Math.max(0, feedback.length - visibleFeedback.length);

    // Group by category for the Pro view, preserving the category ordering.
    const grouped = categories
        .map((cat) => ({
            ...cat,
            items: feedback.filter((f) => {
                // Category scores use display names ("Content Quality"); feedback
                // uses the short key ("Content"). Match on the key prefix.
                return cat.name.toLowerCase().startsWith(f.category.toLowerCase());
            }),
        }))
        .filter((c) => c.items.length > 0);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold break-words">
                        Analysis Results for {title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-slate-500 text-sm">{subtitle}</p>
                        {overallScore >= 92 && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Best Rated
                            </span>
                        )}
                    </div>
                </div>
                {secondaryAction && (
                    <Button variant="outline" onClick={secondaryAction.onClick} className="w-full sm:w-auto shrink-0">
                        {secondaryAction.label}
                    </Button>
                )}
            </div>

            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10 lg:mb-12">
                <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border p-6 sm:p-8 flex flex-col items-center justify-center text-center">
                    <div className="text-base sm:text-lg font-medium text-muted-foreground mb-4">Overall Score</div>
                    <div
                        className={`text-5xl sm:text-6xl font-black mb-4 ${
                            overallScore >= 80
                                ? 'text-green-500'
                                : overallScore >= 50
                                  ? 'text-yellow-500'
                                  : 'text-red-500'
                        }`}
                    >
                        {overallScore}
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                        <div
                            className={`h-full ${
                                overallScore >= 80
                                    ? 'bg-green-500'
                                    : overallScore >= 50
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                            }`}
                            style={{ width: `${overallScore}%` }}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {overallScore >= 80
                            ? 'Your resume is ready for applications!'
                            : 'There is room for improvement.'}
                    </p>
                </div>

                <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border p-6 sm:p-8">
                    <h3 className="text-lg sm:text-xl font-bold mb-6">Score Breakdown</h3>
                    <div className="space-y-5 sm:space-y-6">
                        {categories.map((cat) => (
                            <div key={cat.name}>
                                <div className="flex justify-between mb-2 gap-3">
                                    <span className="font-medium text-sm sm:text-base">{cat.name}</span>
                                    <span className="text-muted-foreground text-sm shrink-0">
                                        {cat.score}/{cat.maxScore}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${
                                            cat.score === cat.maxScore
                                                ? 'bg-green-500'
                                                : cat.score > cat.maxScore / 2
                                                  ? 'bg-yellow-500'
                                                  : 'bg-red-500'
                                        }`}
                                        style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {cat.score === cat.maxScore ? 'Excellent' : 'Needs attention'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {onOptimize && (
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 lg:mb-12">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to improve your score?</h2>
                        <p className="text-indigo-100 max-w-xl text-sm sm:text-base">
                            Open this resume in the builder with all your data pre-loaded, and start
                            fixing the issues.
                        </p>
                    </div>
                    <Button
                        size="lg"
                        variant="secondary"
                        className="shrink-0 gap-2 font-semibold w-full md:w-auto"
                        onClick={onOptimize}
                    >
                        <Sparkles className="w-4 h-4" />
                        Edit &amp; Optimize in Builder
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            )}

            <div className="space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h3 className="text-xl sm:text-2xl font-bold">
                        {isPro ? 'Detailed Feedback' : 'Top Issues'}
                    </h3>
                    {isPro ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold border border-green-200 dark:border-green-900/40">
                            <CheckCircle2 className="w-3 h-3" />
                            Pro plan active, full analysis unlocked
                        </span>
                    ) : (
                        <span className="text-sm text-muted-foreground">
                            Showing your {FREE_VISIBLE_ISSUES} highest-impact issues
                        </span>
                    )}
                </div>

                {missingKeywords.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/30 p-6 flex flex-col sm:flex-row gap-4">
                        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg h-fit w-fit text-red-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-red-900 dark:text-red-400 mb-1">Missing Keywords</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Your resume is missing some key terms commonly found in job descriptions.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {missingKeywords.map((k, idx) => (
                                    <span
                                        key={`${k}-${idx}`}
                                        className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-md border border-red-100 dark:border-red-900/30"
                                    >
                                        {k}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {isPro ? (
                    grouped.map((cat) => (
                        <div key={cat.name} className="space-y-4">
                            <h4 className="text-lg font-semibold border-b pb-2">{cat.name}</h4>
                            {cat.items.map((item, i) => (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-slate-900 rounded-xl border p-5 sm:p-6 flex gap-4"
                                >
                                    <div
                                        className={`p-2 rounded-lg h-fit text-white shrink-0 ${
                                            item.type === 'error'
                                                ? 'bg-red-500'
                                                : item.type === 'warning'
                                                  ? 'bg-yellow-500'
                                                  : 'bg-green-500'
                                        }`}
                                    >
                                        {item.type === 'success' ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="space-y-3 min-w-0">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                                            {item.message}
                                        </p>
                                        {item.detail && (
                                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                                {item.detail}
                                            </p>
                                        )}
                                        {item.solution && (
                                            <div className="flex gap-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 p-4">
                                                <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-1">
                                                        How to fix it
                                                    </p>
                                                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                                        {item.solution}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <>
                        {visibleFeedback.map((item, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-slate-900 rounded-xl border p-5 sm:p-6 flex gap-4"
                            >
                                <div
                                    className={`p-2 rounded-lg h-fit text-white shrink-0 ${
                                        item.type === 'error'
                                            ? 'bg-red-500'
                                            : item.type === 'warning'
                                              ? 'bg-yellow-500'
                                              : 'bg-green-500'
                                    }`}
                                >
                                    {item.type === 'success' ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold mb-1">{item.category}</h4>
                                    <p className="text-sm text-muted-foreground">{item.message}</p>
                                </div>
                            </div>
                        ))}

                        <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 p-6 sm:p-8 text-center">
                            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg sm:text-xl font-bold mb-2">
                                {hiddenCount} more issues found
                            </h4>
                            <p className="text-muted-foreground max-w-lg mx-auto mb-6 text-sm sm:text-base">
                                Shortlist Pro shows every issue with a full explanation of why it costs
                                you points and a step-by-step fix you can apply right away, plus
                                unlimited job scans and watermark-free exports.
                            </p>
                            <Button size="lg" onClick={() => router.push('/pricing')} className="gap-2">
                                <Crown className="w-4 h-4" />
                                Unlock full analysis
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
