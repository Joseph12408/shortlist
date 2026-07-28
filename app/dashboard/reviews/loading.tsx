import { DashboardHeaderSkeleton, ReviewsSkeleton } from "@/components/skeletons";

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <DashboardHeaderSkeleton />
            <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <ReviewsSkeleton />
            </main>
        </div>
    );
}
