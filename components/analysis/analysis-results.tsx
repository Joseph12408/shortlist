"use client";

import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Lock,
    Lightbulb,
    Crown,
    Wand2,
    ShieldCheck,
} from "lucide-react";
import { prioritizeFeedback, ATSFeedback } from "@/lib/ats/ats-score";
import { FREE_VISIBLE_ISSUES } from "@/lib/tiers";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { scoreTone } from "@/components/analysis/resume-analysis-card";
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

/** Circular overall-score gauge. */
function ScoreGauge({ value }: { value: number }) {
    return (
        <div className="w-32 h-32 relative flex items-center justify-center shrink-0">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                <path
                    className="text-muted"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                />
                <path
                    className={scoreTone(value)}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${value}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`font-heading text-3xl font-bold leading-none ${scoreTone(value)}`}>
                    {value}
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5">/100</span>
            </div>
        </div>
    );
}

/** Category ratio → status badge. */
function pillarStatus(pct: number): { label: string; cls: string } {
    if (pct >= 90) return { label: "Excellent", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" };
    if (pct >= 75) return { label: "Strong", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" };
    if (pct >= 60) return { label: "Good", cls: "bg-primary/10 text-primary" };
    return { label: "Needs Work", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" };
}

/**
 * Renders a resume analysis as a full report.
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

    // Group feedback under its category for the Pro pillar view.
    const grouped = categories
        .map((cat) => ({
            ...cat,
            pct: Math.round((cat.score / cat.maxScore) * 100),
            items: feedback.filter((f) => cat.name.toLowerCase().startsWith(f.category.toLowerCase())),
        }));

    const strengths = feedback.filter((f) => f.type === "success").length;
    const toImprove = feedback.filter((f) => f.type !== "success").length;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
            {/* Header card */}
            <div className="bg-card rounded-xl border shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground flex-wrap">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ATS engine verified
                    </span>
                    {subtitle && (
                        <>
                            <span>•</span>
                            <span>{subtitle}</span>
                        </>
                    )}
                </div>
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight break-words">
                            {title}
                        </h2>
                        {overallScore >= 92 && (
                            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                <Sparkles className="w-3 h-3" />
                                Top-tier match
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {secondaryAction && (
                            <Button variant="outline" onClick={secondaryAction.onClick} className="gap-1.5">
                                {secondaryAction.label}
                            </Button>
                        )}
                        {onOptimize && (
                            <Button onClick={onOptimize} className="gap-1.5">
                                <Wand2 className="w-4 h-4" />
                                Optimize in Builder
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Score + metric summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col items-center justify-center text-center">
                    <ScoreGauge value={overallScore} />
                    <p className="text-sm font-medium mt-3">
                        {overallScore >= 80
                            ? "Interview-ready profile"
                            : overallScore >= 50
                              ? "Room to improve"
                              : "Needs attention"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {strengths} strengths · {toImprove} to improve
                    </p>
                </div>

                <div className="md:col-span-2 bg-card rounded-xl border shadow-sm p-5 sm:p-6">
                    <h3 className="font-heading text-lg font-semibold mb-4">Score breakdown</h3>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                        {grouped.map((cat) => (
                            <div key={cat.name}>
                                <div className="flex justify-between mb-1.5 gap-3">
                                    <span className="font-medium text-sm truncate">{cat.name}</span>
                                    <span className="text-muted-foreground text-sm shrink-0">
                                        {cat.score}/{cat.maxScore}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${
                                            cat.pct >= 80
                                                ? "bg-emerald-500"
                                                : cat.pct >= 50
                                                  ? "bg-amber-500"
                                                  : "bg-red-500"
                                        }`}
                                        style={{ width: `${cat.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Optimize banner */}
            {onOptimize && (
                <div className="bg-gradient-to-r from-primary/10 to-transparent border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                            <Wand2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-heading text-base font-semibold">Ready to lift your score?</h3>
                            <p className="text-sm text-muted-foreground">
                                Open this resume in the builder with everything pre-loaded and fix the
                                findings below.
                            </p>
                        </div>
                    </div>
                    <Button onClick={onOptimize} className="gap-1.5 shrink-0 w-full sm:w-auto">
                        Edit &amp; optimize
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Missing keywords */}
            {missingKeywords.length > 0 && (
                <div className="bg-card rounded-xl border p-5 sm:p-6">
                    <h4 className="flex items-center gap-2 font-heading text-base font-semibold mb-1">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        Missing keywords
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                        Terms commonly found in matching job descriptions that your resume is missing.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {missingKeywords.map((k, idx) => (
                            <span
                                key={`${k}-${idx}`}
                                className="px-2.5 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-full"
                            >
                                {k}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* The audit */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <h3 className="font-heading text-xl font-bold">
                        {isPro ? "5-pillar comprehensive audit" : "Top issues"}
                    </h3>
                    {isPro ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Pro plan — full analysis unlocked
                        </span>
                    ) : (
                        <span className="text-sm text-muted-foreground">
                            Showing your {FREE_VISIBLE_ISSUES} highest-impact issues
                        </span>
                    )}
                </div>

                {isPro ? (
                    grouped.map((cat, idx) => {
                        const status = pillarStatus(cat.pct);
                        return (
                            <div key={cat.name} className="bg-card rounded-xl border shadow-sm p-5 sm:p-6">
                                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-heading text-base font-semibold">
                                            {idx + 1}. {cat.name}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status.cls}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-0.5">
                                        <span className={`font-heading text-2xl font-bold ${scoreTone(cat.pct)}`}>
                                            {cat.score}
                                        </span>
                                        <span className="text-xs text-muted-foreground">/{cat.maxScore}</span>
                                    </div>
                                </div>

                                {cat.items.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No issues flagged in this area.
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {cat.items.map((item, i) => (
                                            <div key={i} className="rounded-lg border bg-background/40 p-4 flex gap-3">
                                                <div
                                                    className={`p-1.5 rounded-md h-fit text-white shrink-0 ${
                                                        item.type === "error"
                                                            ? "bg-red-500"
                                                            : item.type === "warning"
                                                              ? "bg-amber-500"
                                                              : "bg-emerald-500"
                                                    }`}
                                                >
                                                    {item.type === "success" ? (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    ) : item.type === "warning" ? (
                                                        <AlertTriangle className="w-4 h-4" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4" />
                                                    )}
                                                </div>
                                                <div className="space-y-2 min-w-0">
                                                    <p className="font-medium text-sm text-foreground">{item.message}</p>
                                                    {item.detail && (
                                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                                            {item.detail}
                                                        </p>
                                                    )}
                                                    {item.solution && (
                                                        <div className="flex gap-2.5 rounded-lg bg-primary/5 border border-primary/15 p-3">
                                                            <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                            <div>
                                                                <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-0.5">
                                                                    How to fix it
                                                                </p>
                                                                <p className="text-sm leading-relaxed text-foreground/80">
                                                                    {item.solution}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <>
                        {visibleFeedback.map((item, i) => (
                            <div key={i} className="bg-card rounded-xl border shadow-sm p-5 flex gap-3">
                                <div
                                    className={`p-1.5 rounded-md h-fit text-white shrink-0 ${
                                        item.type === "error"
                                            ? "bg-red-500"
                                            : item.type === "warning"
                                              ? "bg-amber-500"
                                              : "bg-emerald-500"
                                    }`}
                                >
                                    {item.type === "success" ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-sm mb-0.5">{item.category}</h4>
                                    <p className="text-sm text-muted-foreground">{item.message}</p>
                                </div>
                            </div>
                        ))}

                        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 sm:p-8 text-center">
                            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h4 className="font-heading text-lg sm:text-xl font-bold mb-2">
                                {hiddenCount} more issues found
                            </h4>
                            <p className="text-muted-foreground max-w-lg mx-auto mb-6 text-sm sm:text-base">
                                Shortlist Pro shows every issue across all five pillars with a full
                                explanation and a step-by-step fix, plus unlimited job scans and
                                watermark-free exports.
                            </p>
                            <Button size="lg" onClick={() => router.push("/pricing")} className="gap-2">
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
