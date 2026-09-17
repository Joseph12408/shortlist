"use client";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/layout/dashboard-nav";
import {
    Brain,
    Plus,
    Trash2,
    ArrowRight,
    Briefcase,
    CheckCircle2,
    TrendingUp,
    AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReviewsSkeleton } from "@/components/skeletons";
import { toast } from "@/lib/toast";
import { ResumeAnalysisCard } from "@/components/analysis/resume-analysis-card";

export const dynamic = "force-dynamic";

function formatDate(ms: number) {
    return new Date(ms).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/** Score → status badge + icon tone, matching the analysis hub. */
function reviewBadge(score: number): {
    label: string;
    tone: "success" | "primary" | "warning";
    icon: React.ReactNode;
} {
    if (score >= 85) return { label: "ATS Ready", tone: "success", icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
    if (score >= 70) return { label: "Good", tone: "primary", icon: <TrendingUp className="w-3.5 h-3.5" /> };
    return { label: "Needs Work", tone: "warning", icon: <AlertTriangle className="w-3.5 h-3.5" /> };
}

export default function ReviewsPage() {
    const router = useRouter();
    // undefined while loading, [] when genuinely empty.
    const reviews = useQuery(api.analyses.list);
    const removeReview = useMutation(api.analyses.remove);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this review from your history?")) return;
        try {
            await removeReview({ id: id as any });
        } catch {
            toast.error("Could not delete that review. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader
                title="AI Reviews"
                description="Every analysis you have run, saved so you can revisit the feedback."
                action={
                    <Button onClick={() => router.push("/analysis")} className="w-full md:w-auto gap-2">
                        <Plus className="w-4 h-4" />
                        New Review
                    </Button>
                }
            />

            <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {reviews === undefined ? (
                    <ReviewsSkeleton />
                ) : reviews.length === 0 ? (
                    <div className="text-center py-16 sm:py-20 bg-card rounded-xl border border-dashed px-4">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <Brain className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-heading text-xl font-bold mb-2">No reviews yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Run an AI review on a resume and the full results will be saved here so
                            you can come back to them any time.
                        </p>
                        <Button onClick={() => router.push("/analysis")} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Run your first review
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {reviews.map((review: any) => {
                            const badge = reviewBadge(review.overallScore);
                            const c = review.issueCounts || { errors: 0, warnings: 0, successes: 0 };
                            return (
                                <ResumeAnalysisCard
                                    key={review._id}
                                    title={review.resumeTitle}
                                    iconTone={badge.tone}
                                    icon={<Brain className="w-5 h-5" />}
                                    badge={badge}
                                    onClick={() => router.push(`/dashboard/reviews/${review._id}`)}
                                    meta={
                                        <>
                                            <span>{formatDate(review._creationTime)}</span>
                                            {review.jobDescriptionPreview && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Briefcase className="w-3.5 h-3.5" />
                                                        Matched to a job
                                                    </span>
                                                </>
                                            )}
                                        </>
                                    }
                                    insight={
                                        <>
                                            <strong className="text-foreground font-medium">Insights:</strong>{" "}
                                            {c.errors} critical, {c.warnings} to improve, {c.successes} passed.
                                        </>
                                    }
                                    score={{ value: review.overallScore, label: "Score" }}
                                    actions={
                                        <>
                                            <Button
                                                size="sm"
                                                className="gap-1"
                                                onClick={() => router.push(`/dashboard/reviews/${review._id}`)}
                                            >
                                                <span className="hidden sm:inline">View full report</span>
                                                <span className="sm:hidden">Report</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-muted-foreground hover:text-red-500"
                                                onClick={() => handleDelete(review._id)}
                                                aria-label="Delete review"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </>
                                    }
                                />
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
