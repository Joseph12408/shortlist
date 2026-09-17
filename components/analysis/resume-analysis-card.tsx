"use client";

import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The shared "resume in a list" card, used by both the AI Resume Analysis hub
 * and the AI Reviews history. One card design, two data sources, so the two
 * pages feel like one product. Modelled on the Shortlist Precision design:
 * flat white surface, 1px border, blue-primary accents, Outfit heading.
 */

type Tone = "success" | "warning" | "primary" | "error";

const BADGE_TONES: Record<Tone, string> = {
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    primary: "bg-primary/10 text-primary",
    error: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const ICON_TONES: Record<Tone, string> = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    primary: "bg-primary/10 text-primary",
    error: "bg-red-500/10 text-red-600 dark:text-red-400",
};

/** Score → colour, matching the ATS grading elsewhere in the app. */
export function scoreTone(score: number): string {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
}

export interface ResumeAnalysisCardProps {
    title: string;
    /** Leading icon; defaults to a document icon. */
    icon?: React.ReactNode;
    iconTone?: Tone;
    badge?: { label: string; tone: Tone; icon?: React.ReactNode };
    /** Metadata row: target role, timestamp, etc. */
    meta?: React.ReactNode;
    /** Highlighted insight box (e.g. "Key insights: ..."). */
    insight?: React.ReactNode;
    /** Right-hand score chip. */
    score?: { value: number; max?: number; label?: string };
    /** Action buttons rendered on the right. */
    actions?: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export function ResumeAnalysisCard({
    title,
    icon,
    iconTone = "primary",
    badge,
    meta,
    insight,
    score,
    actions,
    onClick,
    className,
}: ResumeAnalysisCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-card rounded-xl border p-4 sm:p-5 shadow-sm transition-shadow",
                onClick && "cursor-pointer hover:shadow-md hover:border-primary/40",
                className
            )}
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: icon + details */}
                <div className="flex items-start gap-3.5 min-w-0">
                    <div
                        className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                            ICON_TONES[iconTone]
                        )}
                    >
                        {icon ?? <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-heading text-base sm:text-lg font-semibold text-foreground truncate">
                                {title}
                            </h4>
                            {badge && (
                                <span
                                    className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0",
                                        BADGE_TONES[badge.tone]
                                    )}
                                >
                                    {badge.icon}
                                    {badge.label}
                                </span>
                            )}
                        </div>
                        {meta && (
                            <div className="flex items-center gap-2.5 mt-1 flex-wrap text-sm text-muted-foreground">
                                {meta}
                            </div>
                        )}
                        {insight && (
                            <p className="text-sm text-muted-foreground mt-2 bg-muted/60 p-2.5 rounded-lg">
                                {insight}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: score + actions */}
                <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-5 shrink-0 pt-1 lg:pt-0">
                    {score && (
                        <div className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-muted/60 shrink-0">
                            <div className="flex items-baseline gap-0.5">
                                <span
                                    className={cn(
                                        "text-2xl font-heading font-semibold leading-none",
                                        scoreTone(score.value)
                                    )}
                                >
                                    {score.value}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    /{score.max ?? 100}
                                </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground mt-0.5">
                                {score.label ?? "Score"}
                            </span>
                        </div>
                    )}
                    {actions && (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
