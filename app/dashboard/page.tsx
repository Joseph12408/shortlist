"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  LayoutDashboard, 
  Files, 
  Zap, 
  BarChart3, 
  TrendingUp, 
  Award, 
  Search, 
  Bell, 
  HelpCircle, 
  MoreHorizontal, 
  ChevronRight,
  Brain,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { resume, savedResumes, savedCoverLetters, createNewResume, stats } = useResumeStore();
  const router = useRouter();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  // Trigger progress bar animations on load
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateResume = () => {
    createNewResume();
    router.push("/builder");
  };

  const handleEdit = (id: string) => {
    router.push(`/builder?mode=edit&resumeId=${id}`);
  };

  // Calculate stats from the live store
  const scoredResumes = (savedResumes || []).filter(r => (r.atsScore || 0) > 0);
  const avgScore = scoredResumes.length > 0
    ? Math.round(scoredResumes.reduce((acc, curr) => acc + (curr.atsScore || 0), 0) / scoredResumes.length)
    : 88; // Premium fallback if no reviews scored yet

  // Dynamic AI Grading Metrics from active resume or fallback
  const contentRelevance = resume?.categoryScores?.Content
    ? Math.round((resume.categoryScores.Content.score / resume.categoryScores.Content.maxScore) * 100)
    : 90;
  const formatting = resume?.categoryScores?.Structure
    ? Math.round((resume.categoryScores.Structure.score / resume.categoryScores.Structure.maxScore) * 100)
    : 85;
  const keywordOpt = resume?.categoryScores?.Keywords
    ? Math.round((resume.categoryScores.Keywords.score / resume.categoryScores.Keywords.maxScore) * 100)
    : 92;
  const toneAnalysis = resume?.categoryScores?.Writing
    ? Math.round((resume.categoryScores.Writing.score / resume.categoryScores.Writing.maxScore) * 100)
    : 84;

  // Compile real reviews or display high-fidelity mock ones when empty
  const displayReviews = (savedResumes && savedResumes.length > 0)
    ? savedResumes.slice(0, 3).map(r => ({
        id: r.id,
        title: r.title || "Untitled Resume",
        role: r.experience?.[0]?.title || "Professional Profile",
        date: "Updated recently",
        score: r.atsScore || 75,
        isDemo: false
      }))
    : [
        { id: "demo-1", title: "Senior Product Designer.pdf", role: "Product Designer", date: "Oct 24, 2023", score: 94, isDemo: true },
        { id: "demo-2", title: "Marketing Lead_V2.pdf", role: "Marketing Manager", date: "Oct 21, 2023", score: 78, isDemo: true },
        { id: "demo-3", title: "Software Engineer.pdf", role: "Frontend Dev", date: "Oct 18, 2023", score: 86, isDemo: true }
      ];

  const hasResumes = (savedResumes || []).length > 0;
  const welcomeSubtext = hasResumes 
    ? "Your career health looks great. Keep optimizing to stand out to employers!"
    : "Get started by uploading your resume or creating one with our AI builder.";

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 pb-20">
      {/* Sub-nav / Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                Welcome back, {user?.firstName || "Alex"}! <span className="animate-pulse">👋</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {welcomeSubtext}
              </p>
            </div>
            <Button 
              onClick={handleCreateResume}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl py-6 px-6 flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-98 transition-all duration-200 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              Upload Resume
            </Button>
          </div>

          <nav className="flex items-center gap-6 border-b border-transparent">
            <Link 
              href="/dashboard" 
              className="pb-3 border-b-2 border-blue-600 font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </Link>
            <Link 
              href="/dashboard/resumes" 
              className="pb-3 border-b-2 border-transparent hover:border-slate-300 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-2 transition-all"
            >
              <Files className="w-4 h-4" />
              My Resumes
            </Link>
            <Link 
              href="/dashboard/cover-letters" 
              className="pb-3 border-b-2 border-transparent hover:border-slate-300 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4" />
              Cover Letters
            </Link>
            <Link 
              href="/analysis" 
              className="pb-3 border-b-2 border-transparent hover:border-slate-300 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-2 transition-all"
            >
              <Brain className="w-4 h-4" />
              AI Reviews
            </Link>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-6 py-10 space-y-8 max-w-7xl">
        {/* Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Resumes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl group hover:border-blue-500/40 hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-none transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                <Files className="w-5 h-5" />
              </div>
              <span className="text-emerald-500 text-xs font-semibold flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" /> +2
              </span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Resumes</p>
            <p className="text-3xl font-bold font-heading text-slate-900 dark:text-white mt-1">{(savedResumes || []).length}</p>
          </div>

          {/* Cover Letters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl group hover:border-blue-500/40 hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-none transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-emerald-500 text-xs font-semibold flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" /> +1
              </span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Cover Letters</p>
            <p className="text-3xl font-bold font-heading text-slate-900 dark:text-white mt-1">{(savedCoverLetters || []).length}</p>
          </div>

          {/* AI Reviews */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl group hover:border-blue-500/40 hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-none transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-slate-400 dark:text-slate-500 text-xs bg-slate-50 dark:bg-slate-850 px-2 py-1 rounded-full font-medium">This Month</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">AI Reviews</p>
            <p className="text-3xl font-bold font-heading text-slate-900 dark:text-white mt-1">{stats?.totalReviews || 0}</p>
          </div>

          {/* Avg. AI Rating */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl group hover:border-blue-500/40 hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-none transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90">
                  <circle className="text-slate-100 dark:text-slate-800" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" strokeWidth="4"></circle>
                  <circle 
                    className="text-emerald-500 dark:text-emerald-400 transition-all duration-1000" 
                    cx="20" cy="20" 
                    fill="transparent" 
                    r="16" 
                    stroke="currentColor" 
                    strokeDasharray="100" 
                    strokeDashoffset={100 - avgScore} 
                    strokeWidth="4"
                  ></circle>
                </svg>
              </div>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Avg. AI Rating</p>
            <p className="text-3xl font-bold font-heading text-slate-900 dark:text-white mt-1">
              {avgScore}<span className="text-sm font-normal text-slate-400">/100</span>
            </p>
          </div>
        </section>

        {/* Middle Section: AI Grading & Recent Reviews */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* AI Grading System */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-8 rounded-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  AI Grading System
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Detailed performance breakdown based on current standards.</p>
              </div>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Content Relevance */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Content Relevance</span>
                  <span className="text-blue-600 dark:text-blue-400">{contentRelevance}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: mounted ? `${contentRelevance}%` : '0%' }}
                  ></div>
                </div>
              </div>

              {/* Formatting */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Formatting &amp; Layout</span>
                  <span className="text-blue-600 dark:text-blue-400">{formatting}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: mounted ? `${formatting}%` : '0%' }}
                  ></div>
                </div>
              </div>

              {/* Keyword Optimization */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Keyword Optimization</span>
                  <span className="text-blue-600 dark:text-blue-400">{keywordOpt}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: mounted ? `${keywordOpt}%` : '0%' }}
                  ></div>
                </div>
              </div>

              {/* Tone Analysis */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Writing Style &amp; Tone</span>
                  <span className="text-blue-600 dark:text-blue-400">{toneAnalysis}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: mounted ? `${toneAnalysis}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Recent Reviews</h3>
                <Link 
                  href="/dashboard/resumes" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-xs font-semibold hover:underline flex items-center gap-0.5"
                >
                  View All
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-4">
                {displayReviews.map((item, index) => {
                  const isHigh = item.score >= 80;
                  const isLow = item.score < 60;
                  const scoreColor = isHigh 
                    ? "text-emerald-500 dark:text-emerald-400" 
                    : isLow 
                    ? "text-red-500 dark:text-red-400" 
                    : "text-amber-500 dark:text-amber-400";
                  
                  return (
                    <div 
                      key={item.id}
                      onClick={() => !item.isDemo ? handleEdit(item.id) : handleCreateResume()}
                      className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 rounded-xl group hover:border-blue-500/30 hover:bg-slate-100/30 dark:hover:bg-slate-900/50 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate text-slate-800 dark:text-slate-200">{item.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 font-medium truncate">{item.role}</span>
                            {item.isDemo && (
                              <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Demo</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right pl-3">
                        <p className={`font-bold font-heading text-lg ${scoreColor}`}>{item.score}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-semibold">Score</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {!hasResumes && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850">
                <Button 
                  onClick={handleCreateResume}
                  variant="outline"
                  className="w-full text-xs font-semibold py-5 border-dashed border-slate-300 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create real review analysis
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Bottom Section: How it Works */}
        <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-blue-500/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Brain className="w-5 h-5 text-blue-200" />
              </div>
              <h3 className="text-xl font-bold font-heading">How Shortlist AI Works</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="space-y-4 group">
                <div className="w-12 h-12 bg-white/10 group-hover:bg-white/15 rounded-xl flex items-center justify-center font-bold text-xl border border-white/20 shadow-inner group-hover:scale-105 transition-all duration-200">1</div>
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-white/90">Upload</h4>
                  <p className="text-xs text-blue-100/80 leading-relaxed">Select and upload your resume file securely from your local device storage.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-4 group">
                <div className="w-12 h-12 bg-white/10 group-hover:bg-white/15 rounded-xl flex items-center justify-center font-bold text-xl border border-white/20 shadow-inner group-hover:scale-105 transition-all duration-200">2</div>
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-white/90">AI Analysis</h4>
                  <p className="text-xs text-blue-100/80 leading-relaxed">Our system parses and scans it instantly against global industry standards and ATS rules.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-4 group">
                <div className="w-12 h-12 bg-white/10 group-hover:bg-white/15 rounded-xl flex items-center justify-center font-bold text-xl border border-white/20 shadow-inner group-hover:scale-105 transition-all duration-200">3</div>
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-white/90">Grade &amp; Feedback</h4>
                  <p className="text-xs text-blue-100/80 leading-relaxed">Receive complete performance metrics, score cards, and detailed audit lists.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-4 group">
                <div className="w-12 h-12 bg-white/10 group-hover:bg-white/15 rounded-xl flex items-center justify-center font-bold text-xl border border-white/20 shadow-inner group-hover:scale-105 transition-all duration-200">4</div>
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-white/90">Optimize</h4>
                  <p className="text-xs text-blue-100/80 leading-relaxed">Use AI generation to implement fixes, boost keywords, and export in a single click.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

