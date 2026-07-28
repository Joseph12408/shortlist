import { AnalysisDetailSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="bg-white dark:bg-slate-900 border-b p-4 sm:p-6">
                <div className="container mx-auto flex items-center justify-between">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-6 w-32" />
                    <div className="w-8 sm:w-24" />
                </div>
            </div>
            <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
                <AnalysisDetailSkeleton />
            </main>
        </div>
    );
}
