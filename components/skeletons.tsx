import { Skeleton } from "@/components/ui/skeleton";

/**
 * Page-shaped loading states.
 *
 * These deliberately mirror the real layout of each page so the transition
 * reads as "content arriving" rather than "something reloaded", and so nothing
 * shifts position once data lands.
 */

/** The dashboard sub-header: title, action button, tab row. */
export function DashboardHeaderSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="space-y-2 w-full md:w-auto">
                        <Skeleton className="h-8 w-52" />
                        <Skeleton className="h-4 w-72 max-w-full" />
                    </div>
                    <Skeleton className="h-10 w-full md:w-36 rounded-xl" />
                </div>
                <div className="flex items-center gap-4 sm:gap-6 pb-3 overflow-hidden">
                    {[64, 88, 92, 80].map((w, i) => (
                        <Skeleton key={i} className="h-5 shrink-0" style={{ width: w }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Grid of document cards, used by My Resumes and Cover Letters. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-64"
                >
                    <Skeleton className="h-32 w-full rounded-none" />
                    <div className="p-6 flex-1 flex flex-col gap-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <div className="mt-auto flex gap-2">
                            <Skeleton className="h-8 flex-1" />
                            <Skeleton className="h-8 w-10" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Stacked review rows on the AI Reviews list. */
export function ReviewsSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6"
                >
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-14 shrink-0" />
                        <div className="flex-1 space-y-2 min-w-0">
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-3 w-1/3" />
                            <div className="flex gap-3 pt-1">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-5 w-5 shrink-0" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Score card, breakdown and feedback list on a stored review. */
export function AnalysisDetailSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="h-4 w-40" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-xl border p-8 flex flex-col items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-14 w-20" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-3 w-32" />
                </div>
                <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl border p-8 space-y-6">
                    <Skeleton className="h-6 w-40" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                            <Skeleton className="h-2 w-full" />
                        </div>
                    ))}
                </div>
            </div>

            <Skeleton className="h-32 w-full rounded-xl" />

            <div className="space-y-4">
                <Skeleton className="h-7 w-48" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-slate-900 rounded-xl border p-6 flex gap-4"
                    >
                        <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-4/5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Metric tiles + panels on the dashboard overview. */
export function DashboardOverviewSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl space-y-4"
                    >
                        <div className="flex justify-between">
                            <Skeleton className="h-11 w-11 rounded-xl" />
                            <Skeleton className="h-6 w-14 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-8 rounded-2xl space-y-6">
                    <Skeleton className="h-6 w-48" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-4 w-10" />
                            </div>
                            <Skeleton className="h-2.5 w-full rounded-full" />
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-8 rounded-2xl space-y-4">
                    <Skeleton className="h-6 w-36" />
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}
