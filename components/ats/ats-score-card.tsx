"use client";

import { Progress } from "@/components/ui/progress";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { CheckCircle2, AlertCircle, AlertTriangle, Lightbulb, Lock } from "lucide-react";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { prioritizeFeedback, ATSFeedback } from "@/lib/ats/ats-score";
import { FREE_VISIBLE_ISSUES } from "@/lib/tiers";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ATSScoreCard() {
    const store = useResumeStore();
    const { isPro } = useFeatureAccess();
    const router = useRouter();

    // These are optional on the store (undefined before the first analysis run).
    const atsScore = store.atsScore ?? 0;
    const atsFeedback = store.atsFeedback;
    const jobDescription = store.jobDescription ?? '';

    if (!jobDescription.trim()) {
        return (
            <div className="p-4 border rounded-lg bg-muted/20 text-center">
                <p className="text-sm text-muted-foreground">Paste a Job Description to get your ATS Score.</p>
            </div>
        )
    }

    let colorClass = "bg-red-500";
    let textColor = "text-red-500";
    let statusIcon = <AlertCircle className="h-5 w-5 text-red-500" />;
    let message = "Needs Improvement";

    if (atsScore >= 70) {
        colorClass = "bg-green-500";
        textColor = "text-green-500";
        statusIcon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
        message = "Great Match!";
    } else if (atsScore >= 40) {
        colorClass = "bg-yellow-500";
        textColor = "text-yellow-500";
        statusIcon = <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        message = "Getting There";
    }

    const allFeedback = (atsFeedback || []) as ATSFeedback[];
    // Free users see only their highest-impact issues; Pro sees everything.
    const visibleFeedback = isPro
        ? allFeedback
        : prioritizeFeedback(allFeedback).slice(0, FREE_VISIBLE_ISSUES);
    const hiddenCount = allFeedback.length - visibleFeedback.length;

    return (
        <div className="p-4 border rounded-lg bg-card shadow-sm space-y-4">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">ATS Score</h3>
                    <div className="flex items-center gap-2">
                        {statusIcon}
                        <span className={`font-bold ${textColor}`}>{message}</span>
                    </div>
                </div>

                <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold">{atsScore}</span>
                    <span className="text-muted-foreground mb-1">/ 100</span>
                </div>

                <Progress value={atsScore} className="h-3" indicatorClassName={colorClass} />
                <p className="mt-2 text-xs text-muted-foreground">Based on keyword matching and completeness.</p>
            </div>

            {visibleFeedback.length > 0 && (
                <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">Optimization Tips</h4>
                    <div className="space-y-4">
                        {visibleFeedback.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-start text-sm">
                                <div className="mt-0.5 shrink-0">
                                    {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                    {item.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <span className="font-medium mr-1">{item.category}:</span>
                                        <span className="text-muted-foreground">{item.message}</span>
                                    </div>

                                    {/* The explanation + fix are the paid half of the analysis. */}
                                    {isPro && item.detail && (
                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            {item.detail}
                                        </p>
                                    )}
                                    {isPro && item.solution && (
                                        <div className="flex gap-2 rounded-md bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 p-2.5">
                                            <Lightbulb className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                                                {item.solution}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isPro && (
                        <div className="mt-4 rounded-lg border border-dashed border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 text-center">
                            <Lock className="w-4 h-4 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                            <p className="text-xs text-muted-foreground mb-3">
                                {hiddenCount > 0
                                    ? `${hiddenCount} more issues, plus the reasoning and step-by-step fix for each, are included in Pro.`
                                    : 'Pro adds the reasoning and a step-by-step fix for every issue.'}
                            </p>
                            <Button size="sm" variant="outline" onClick={() => router.push('/pricing')}>
                                Upgrade to Pro
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
