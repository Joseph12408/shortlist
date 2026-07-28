import { DashboardHeaderSkeleton, DashboardOverviewSkeleton } from "@/components/skeletons";

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-20">
            <DashboardHeaderSkeleton />
            <main className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl">
                <DashboardOverviewSkeleton />
            </main>
        </div>
    );
}
