"use client";

import { Button } from "@/components/ui/button";
import {
    Sparkles,
    UploadCloud,
    Loader2,
    FileText,
    ArrowRight,
    Wand2,
    Crown,
    CheckCircle2,
    TrendingUp,
    Award,
    Files,
} from "lucide-react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "@/lib/toast";
import { AnalysisResults } from "@/components/analysis/analysis-results";
import { ResumeAnalysisCard, scoreTone } from "@/components/analysis/resume-analysis-card";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { analyzeResume } from "@/lib/ats/ats-score";

/** Circular score gauge used in the KPI row. */
function ScoreRing({ value }: { value: number }) {
    return (
        <div className="w-14 h-14 relative flex items-center justify-center shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path
                    className="text-muted"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                />
                <path
                    className={scoreTone(value)}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${value}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                />
            </svg>
            <span className="absolute text-xs font-semibold">{value}%</span>
        </div>
    );
}

/** Score → status badge used on each resume card. */
function statusBadge(score: number): { label: string; tone: "success" | "primary" | "warning"; icon: React.ReactNode } {
    if (score >= 85) return { label: "ATS Ready", tone: "success", icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
    if (score >= 70) return { label: "Good Match", tone: "primary", icon: <TrendingUp className="w-3.5 h-3.5" /> };
    return { label: "Needs Work", tone: "warning", icon: <Wand2 className="w-3.5 h-3.5" /> };
}

export default function AnalysisPage() {
    const store = useResumeStore();
    const {
        resume,
        savedResumes,
        atsFeedback,
        categoryScores,
        runATSAnalysis,
        setResume,
        incrementReviewCount,
        recordAnalysis,
    } = store;
    const router = useRouter();
    const { isPro } = useFeatureAccess();

    // Optional on the store until the first analysis run.
    const atsScore = store.atsScore ?? 0;
    const missingKeywords = store.missingKeywords ?? [];

    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const [fileName, setFileName] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [analysisStep, setAnalysisStep] = useState("");
    const [hasRecorded, setHasRecorded] = useState(false);

    // Score every saved resume up front so the list and the KPI row agree.
    const scored = useMemo(
        () =>
            (savedResumes || []).map((r: any) => ({
                resume: r,
                score: analyzeResume(r, "").overallScore,
            })),
        [savedResumes]
    );

    const stats = useMemo(() => {
        if (scored.length === 0) return { avg: 0, best: 0, count: 0 };
        const scores = scored.map((s) => s.score);
        return {
            avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            best: Math.max(...scores),
            count: scored.length,
        };
    }, [scored]);

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            const pdfjsLib = await import("pdfjs-dist");
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            }
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(" ");
                fullText += pageText + "\n";
            }
            return fullText;
        } catch (error: any) {
            console.error("PDF Parse Error:", error);
            if (error.name === "MissingPDFException") throw new Error("That file doesn't look like a valid PDF.");
            if (error.message?.includes("worker"))
                throw new Error("Couldn't load the PDF reader. Please check your internet connection.");
            throw new Error("Couldn't read that PDF. Please try a different file.");
        }
    };

    const handleFileUpload = async (file: File) => {
        setFileName(file.name);
        setIsUploading(true);
        try {
            setAnalysisStep("Extracting text...");
            let text = "";
            if (file.type === "application/pdf") {
                text = await extractTextFromPDF(file);
            } else {
                text = await file.text();
            }

            setAnalysisStep("Analyzing content...");
            const res = await fetch("/api/parse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();

            if (data.success && data.resume) {
                setResume({ ...data.resume, title: file.name });
                setHasRecorded(false);
                setIsAnalyzed(true);
                incrementReviewCount();
            } else {
                toast.error(data.error || "Something went wrong reading your resume. Please try again.");
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Something went wrong processing your file. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // Trigger analysis when resume updates AND we are in analysis mode.
    useEffect(() => {
        if (isAnalyzed) runATSAnalysis();
    }, [resume, isAnalyzed]);

    // Persist the finished review once per analysis (shows up under AI Reviews).
    useEffect(() => {
        if (!isAnalyzed || hasRecorded) return;
        if (atsScore === undefined || !categoryScores || Object.keys(categoryScores).length === 0) return;
        setHasRecorded(true);
        recordAnalysis(resume.title || fileName || "Untitled Resume");
    }, [isAnalyzed, hasRecorded, atsScore, categoryScores, resume.title, fileName, recordAnalysis]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0]);
    };

    const analyzeSaved = (r: any) => {
        setResume(r);
        setHasRecorded(false);
        setIsAnalyzed(true);
        incrementReviewCount();
        setFileName(r.title || r.profile?.fullName || "Saved Resume");
    };

    // Optimization is a Pro feature. Free users are sent to pricing; the server
    // enforces this too, this is the first, visible gate.
    const optimize = (r: any) => {
        useResumeStore.getState().setResume(r);
        useResumeStore.getState().setViewMode("resume");
        if (!isPro) {
            router.push("/pricing");
            return;
        }
        router.push("/builder?mode=edit&tab=resume");
    };

    const handleOptimizeCurrent = () => {
        useResumeStore.getState().setViewMode("resume");
        if (!isPro) {
            router.push("/pricing");
            return;
        }
        router.push("/builder?mode=edit&tab=resume");
    };

    const handleReset = () => {
        setIsAnalyzed(false);
        setHasRecorded(false);
        setFileName("");
    };

    // ─── RESULTS VIEW ────────────────────────────────────────────
    if (isAnalyzed) {
        return (
            <div className="min-h-screen bg-background">
                <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-4xl">
                    <AnalysisResults
                        data={{
                            title: resume.title || fileName || "Current Resume",
                            subtitle: "Last updated just now",
                            overallScore: atsScore,
                            categories: Object.values(categoryScores || {}).map((c: any) => ({
                                name: c.name,
                                score: c.score,
                                maxScore: c.maxScore,
                            })),
                            feedback: (atsFeedback || []) as any,
                            missingKeywords,
                        }}
                        onOptimize={handleOptimizeCurrent}
                        secondaryAction={{ label: "Back to analysis", onClick: handleReset }}
                    />
                </main>
            </div>
        );
    }

    // ─── HUB VIEW ────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-5xl">
                <div className="flex flex-col gap-6 sm:gap-8">
                    {/* Header */}
                    <div className="flex flex-col gap-1 max-w-2xl">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                <Sparkles className="w-3.5 h-3.5" />
                                AI ATS Engine
                            </span>
                            <span className="text-xs text-muted-foreground">Instant, private scoring</span>
                        </div>
                        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
                            AI Resume Analysis
                        </h1>
                        <p className="text-muted-foreground mt-1 leading-relaxed">
                            Upload a new resume or pick a saved one to run deep ATS checks, keyword
                            gap analysis, and an instant readiness score.
                        </p>
                    </div>

                    {/* Upload card */}
                    <div className="bg-card rounded-xl border shadow-sm p-3 sm:p-4 relative overflow-hidden">
                        <div className="absolute -right-24 -top-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                        <div
                            className={`relative rounded-xl p-6 sm:p-10 flex flex-col items-center text-center border-2 border-dashed transition-all cursor-pointer ${
                                dragActive
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById("file-upload")?.click()}
                        >
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".pdf,.txt,.md"
                                onChange={handleChange}
                            />

                            {isUploading ? (
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                    <p className="font-medium text-muted-foreground">
                                        {analysisStep || "Analyzing your resume..."}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="relative mb-4">
                                        <div className="w-16 h-16 rounded-2xl bg-card shadow-md flex items-center justify-center text-primary">
                                            <UploadCloud className="w-8 h-8" />
                                        </div>
                                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                                            <Sparkles className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                    <h3 className="font-heading text-lg sm:text-xl font-semibold mb-1">
                                        Drag and drop your resume, or browse files
                                    </h3>
                                    <p className="text-sm text-muted-foreground max-w-md mb-5">
                                        Supports PDF and text files. Parsed instantly against modern
                                        ATS rules — nothing is shared without your say-so.
                                    </p>
                                    <Button className="gap-2" onClick={(e) => { e.stopPropagation(); document.getElementById("file-upload")?.click(); }}>
                                        <UploadCloud className="w-4 h-4" />
                                        Select file from device
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* KPI row + list, only when there are saved resumes */}
                    {scored.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="bg-card rounded-xl border shadow-sm p-5 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                            Overall Readiness
                                        </span>
                                        <span className="font-heading text-3xl font-bold mt-1">
                                            {stats.avg}
                                            <span className="text-base text-muted-foreground font-normal">%</span>
                                        </span>
                                        <span className="text-sm text-muted-foreground mt-1">
                                            Average across your resumes
                                        </span>
                                    </div>
                                    <ScoreRing value={stats.avg} />
                                </div>

                                <div className="bg-card rounded-xl border shadow-sm p-5 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                            Saved Resumes
                                        </span>
                                        <span className="font-heading text-3xl font-bold mt-1">{stats.count}</span>
                                        <span className="text-sm text-muted-foreground mt-1">
                                            Ready to analyze anytime
                                        </span>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Files className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="bg-card rounded-xl border shadow-sm p-5 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                            Best ATS Score
                                        </span>
                                        <span className={`font-heading text-3xl font-bold mt-1 ${scoreTone(stats.best)}`}>
                                            {stats.best}
                                            <span className="text-base text-muted-foreground font-normal">%</span>
                                        </span>
                                        <span className="text-sm text-muted-foreground mt-1">
                                            Your strongest resume
                                        </span>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <Award className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-heading text-lg font-semibold">Your resumes</h2>
                                    <span className="text-sm text-muted-foreground">
                                        {stats.count} saved
                                    </span>
                                </div>

                                {scored.map(({ resume: r, score }, idx) => {
                                    const badge = statusBadge(score);
                                    const target = r.profile?.jobTitle || r.experience?.[0]?.title;
                                    return (
                                        <ResumeAnalysisCard
                                            key={`${r.id}-${idx}`}
                                            title={r.title || r.profile?.fullName || "Untitled Resume"}
                                            iconTone="primary"
                                            badge={badge}
                                            meta={
                                                target ? (
                                                    <span className="flex items-center gap-1 text-foreground font-medium">
                                                        <FileText className="w-4 h-4 text-primary" />
                                                        {target}
                                                    </span>
                                                ) : (
                                                    <span>Saved resume</span>
                                                )
                                            }
                                            score={{ value: score, label: "ATS Score" }}
                                            actions={
                                                <>
                                                    <Button size="sm" className="gap-1" onClick={() => analyzeSaved(r)}>
                                                        View report
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1.5"
                                                        onClick={() => optimize(r)}
                                                    >
                                                        {isPro ? (
                                                            <Wand2 className="w-4 h-4" />
                                                        ) : (
                                                            <Crown className="w-4 h-4 text-amber-500" />
                                                        )}
                                                        <span className="hidden sm:inline">Optimize</span>
                                                    </Button>
                                                </>
                                            }
                                        />
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
