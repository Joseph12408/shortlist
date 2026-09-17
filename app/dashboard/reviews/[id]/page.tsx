"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { AnalysisResults } from "@/components/analysis/analysis-results";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase } from "lucide-react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { AnalysisDetailSkeleton } from "@/components/skeletons";
import { toast } from "@/lib/toast";

export const dynamic = "force-dynamic";

export default function ReviewDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const review = useQuery(api.analyses.get, id ? ({ id } as any) : "skip");
    const { savedResumes, loadResume, setViewMode } = useResumeStore();

    const handleOptimize = () => {
        // The stored review references the resume it was run against. If that
        // resume still exists, open it directly; otherwise send the user to the
        // resume list rather than a builder with nothing loaded.
        const target = (savedResumes || []).find((r: any) => r.id === review?.resumeId);

        if (target) {
            setViewMode("resume");
            loadResume(target.id);
            router.push(`/builder?mode=edit&tab=resume&resumeId=${target.id}`);
            return;
        }

        toast.info("That resume is no longer saved. Pick one to keep optimizing.");
        router.push("/dashboard/resumes");
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-4xl">
                <button
                    onClick={() => router.push("/dashboard/reviews")}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">All reviews</span>
                </button>
                {review === undefined ? (
                    <AnalysisDetailSkeleton />
                ) : review === null ? (
                    <div className="text-center py-20">
                        <h2 className="text-xl font-bold mb-2">Review not found</h2>
                        <p className="text-muted-foreground mb-6">
                            This review may have been deleted.
                        </p>
                        <Button onClick={() => router.push("/dashboard/reviews")}>
                            Back to AI Reviews
                        </Button>
                    </div>
                ) : (
                    <>
                        {review.jobDescriptionPreview && (
                            <div className="mb-6 rounded-xl border bg-card p-4 sm:p-6">
                                <h3 className="flex items-center gap-2 text-sm font-semibold mb-2">
                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                    Matched against this job description
                                </h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-4">
                                    {review.jobDescriptionPreview}
                                </p>
                            </div>
                        )}

                        <AnalysisResults
                            data={{
                                title: review.resumeTitle,
                                subtitle: `Reviewed ${new Date(review._creationTime).toLocaleDateString(undefined, {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}`,
                                overallScore: review.overallScore,
                                categories: review.categoryScores,
                                feedback: review.feedback as any,
                                missingKeywords: review.missingKeywords,
                            }}
                            onOptimize={handleOptimize}
                            secondaryAction={{
                                label: "Run New Review",
                                onClick: () => router.push("/analysis"),
                            }}
                        />
                    </>
                )}
            </main>
        </div>
    );
}
