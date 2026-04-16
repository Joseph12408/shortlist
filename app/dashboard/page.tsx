"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Plus, FileText, LayoutDashboard, Files, FileType, Zap, BarChart3, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardOverview from "@/components/ui/dashboard-overview";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
    const { resume, savedResumes, savedCoverLetters, createNewResume, stats, runATSAnalysis } = useResumeStore();
    const router = useRouter();
    const { user } = useUser();



    const handleCreateResume = () => {
        createNewResume();
        // Navigate to builder, which defaults to the pre-builder landing view
        router.push("/builder");
    };

    // calculate average score
    // calculate average score
    const scoredResumes = (savedResumes || []).filter(r => (r.atsScore || 0) > 0);
    const avgScore = scoredResumes.length > 0
        ? Math.round(scoredResumes.reduce((acc, curr) => acc + (curr.atsScore || 0), 0) / scoredResumes.length)
        : 0;

    // Temporary: Logic to reset stats if requested by user (hidden or explicit)
    // For this request, we'll just add a small text button to reset stats
    const handleResetStats = () => {
        useResumeStore.getState().resetStats();
        alert("Stats reset!");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header / Sub-nav */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-6 py-8">
                    <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-white mb-2">
                        Hello, {user?.firstName || "User"} 👋
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Here's what's happening with your job search applications.
                    </p>

                    <nav className="flex items-center gap-6 mt-8 border-b border-transparent">
                        <Link href="/dashboard" className="pb-3 border-b-2 border-primary font-medium text-primary transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/dashboard/resumes" className="pb-3 border-b-2 border-transparent hover:border-slate-300 text-muted-foreground hover:text-foreground transition-colors">
                            My Resumes
                        </Link>
                        <Link href="/dashboard/cover-letters" className="pb-3 border-b-2 border-transparent hover:border-slate-300 text-muted-foreground hover:text-foreground transition-colors">
                            Cover Letters
                        </Link>
                    </nav>
                </div>
            </div>

            <main className="container mx-auto px-6 py-12 space-y-12">
                <DashboardOverview 
                    totalResumes={(savedResumes || []).length}
                    totalCoverLetters={(savedCoverLetters || []).length}
                    totalReviews={stats?.totalReviews || 0}
                    avgScore={avgScore}
                />
            </main>
        </div>
    );
}
