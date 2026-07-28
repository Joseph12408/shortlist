"use client";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/layout/dashboard-nav";
import { Brain, Plus, Trash2, ChevronRight, AlertCircle, AlertTriangle, CheckCircle2, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReviewsSkeleton } from "@/components/skeletons";
import { toast } from "@/lib/toast";

export const dynamic = "force-dynamic";

function scoreColor(score: number) {
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
}

function formatDate(ms: number) {
    return new Date(ms).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function ReviewsPage() {
    const router = useRouter();
    // undefined while loading, [] when genuinely empty.
    const reviews = useQuery(api.analyses.list);
    const removeReview = useMutation(api.analyses.remove);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this review from your history?")) return;
        try {
            await removeReview({ id: id as any });
        } catch {
            toast.error("Could not delete that review. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
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
                    <div className="text-center py-16 sm:py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-4">
                        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Brain className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
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
                    <div className="grid gap-4">
                        {reviews.map((review: any) => (
                            <div
                                key={review._id}
                                onClick={() => router.push(`/dashboard/reviews/${review._id}`)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 cursor-pointer hover:border-blue-500/40 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start sm:items-center gap-4">
                                    <div
                                        className={`shrink-0 text-2xl sm:text-3xl font-bold font-heading ${scoreColor(review.overallScore)}`}
                                    >
                                        {review.overallScore}
                                        <span className="text-xs font-normal text-slate-400">/100</span>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold truncate">{review.resumeTitle}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {formatDate(review._creationTime)}
                                        </p>

                                        <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                                            {review.issueCounts.errors > 0 && (
                                                <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    {review.issueCounts.errors} critical
                                                </span>
                                            )}
                                            {review.issueCounts.warnings > 0 && (
                                                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    {review.issueCounts.warnings} warnings
                                                </span>
                                            )}
                                            {review.issueCounts.successes > 0 && (
                                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    {review.issueCounts.successes} passed
                                                </span>
                                            )}
                                            {review.jobDescriptionPreview && (
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    Matched to a job
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-slate-400 hover:text-red-500"
                                            onClick={(e) => handleDelete(review._id, e)}
                                            aria-label="Delete review"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
