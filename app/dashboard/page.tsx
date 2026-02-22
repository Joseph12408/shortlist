"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Plus, FileText, LayoutDashboard, Files, FileType, Zap, BarChart3, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
    const { resume, savedResumes, savedCoverLetters, createNewResume, stats, runATSAnalysis } = useResumeStore();
    const router = useRouter();
    const [userName, setUserName] = useState("User");

    useEffect(() => {
        if (resume?.profile?.fullName) {
            setUserName(resume.profile.fullName.split(' ')[0]);
        }
    }, [resume]);

    const handleCreateResume = () => {
        createNewResume();
        // Force navigate to builder
        router.push("/builder");
    };

    // calculate average score
    // calculate average score
    const scoredResumes = savedResumes.filter(r => (r.atsScore || 0) > 0);
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
                        Hello, {userName} 👋
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

                {/* Analytics Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                        <span className="text-sm font-medium text-slate-500 mb-1">Total Resumes</span>
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{(savedResumes || []).length}</span>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <Files className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                        <span className="text-sm font-medium text-slate-500 mb-1">Cover Letters</span>
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{(savedCoverLetters || []).length}</span>
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                <FileType className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative group">
                        <span className="text-sm font-medium text-slate-500 mb-1">AI Reviews</span>
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalReviews || 0}</span>
                            <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                                <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <button onClick={handleResetStats} className="absolute top-2 right-2 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                            Reset
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                        <span className="text-sm font-medium text-slate-500 mb-1">Average Score</span>
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{avgScore}</span>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${avgScore >= 80 ? 'bg-green-100 dark:bg-green-900/30' :
                                avgScore >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                    'bg-red-100 dark:bg-red-900/30'
                                }`}>
                                <BarChart3 className={`w-5 h-5 ${avgScore >= 80 ? 'text-green-600 dark:text-green-400' :
                                    avgScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                                        'text-red-600 dark:text-red-400'
                                    }`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scoring Criteria Section */}
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-slate-500" />
                        Scoring Criteria
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "Content", desc: "Impact & metrics", weight: "High", color: "bg-blue-500" },
                            { label: "Structure", desc: "ATS readability", weight: "Critical", color: "bg-indigo-500" },
                            { label: "Keywords", desc: "Job description match", weight: "Critical", color: "bg-emerald-500" },
                            { label: "Writing", desc: "Active voice & clarity", weight: "Medium", color: "bg-amber-500" },
                            { label: "Application", desc: "Completeness check", weight: "High", color: "bg-purple-500" },
                        ].map((criteria) => (
                            <div key={criteria.label} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-2 h-2 rounded-full ${criteria.color}`} />
                                    <h3 className="font-semibold">{criteria.label}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4 h-10">{criteria.desc}</p>
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className="text-slate-500">Weight</span>
                                    <span className={
                                        criteria.weight === 'Critical' ? 'text-red-500' :
                                            criteria.weight === 'High' ? 'text-orange-500' :
                                                'text-blue-500'
                                    }>{criteria.weight}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Cards */}
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Create Resume Card */}
                        <div
                            onClick={handleCreateResume}
                            className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Create New Resume</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                Build a professional resume in minutes with our AI-powered builder.
                            </p>
                            <div className="text-blue-600 dark:text-blue-400 font-medium flex items-center">
                                Start Building <Plus className="w-4 h-4 ml-1" />
                            </div>
                        </div>

                        {/* Create Cover Letter Card */}
                        <Link href="/builder?tab=cover-letter" className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Write Cover Letter</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                Generate a tailored cover letter for your specific job application.
                            </p>
                            <div className="text-purple-600 dark:text-purple-400 font-medium flex items-center">
                                Write Letter <Plus className="w-4 h-4 ml-1" />
                            </div>
                        </Link>

                        {/* AI Review Card */}
                        <Link href="/analysis" className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                            <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Get AI Review</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                Get instant feedback and an ATS score for your current resume.
                            </p>
                            <div className="text-amber-600 dark:text-amber-400 font-medium flex items-center">
                                Analyze Now <Plus className="w-4 h-4 ml-1" />
                            </div>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
