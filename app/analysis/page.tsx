"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Upload, FileText, Loader2 } from "lucide-react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "@/lib/toast";
import { AnalysisResults } from "@/components/analysis/analysis-results";

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

    // Optional on the store until the first analysis run.
    const atsScore = store.atsScore ?? 0;
    const missingKeywords = store.missingKeywords ?? [];

    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const [fileName, setFileName] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [analysisStep, setAnalysisStep] = useState("");
    const [hasRecorded, setHasRecorded] = useState(false);

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            // Dynamically import pdfjs-dist to avoid SSR/bundling issues
            const pdfjsLib = await import('pdfjs-dist');

            // Set worker source if not already set
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                // Use the module worker for v5+
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
            // Full detail stays in the console. Only the three messages below
            // are meant for users, chosen to be actionable and never the raw
            // pdfjs internal error text.
            console.error("PDF Parse Error:", error);
            if (error.name === 'MissingPDFException') {
                throw new Error("That file doesn't look like a valid PDF.");
            }
            if (error.message?.includes('worker')) {
                throw new Error("Couldn't load the PDF reader. Please check your internet connection.");
            }
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
                text = await file.text(); // Simple text/md files
            }

            // Send to Parse API
            setAnalysisStep("Analyzing content...");
            const res = await fetch('/api/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();

            if (data.success && data.resume) {
                const newResume = { ...data.resume, title: file.name };
                setResume(newResume);

                setHasRecorded(false);
                setIsAnalyzed(true);
                incrementReviewCount();
            } else {
                // data.error is already a user-safe message from the API route.
                toast.error(data.error || "Something went wrong reading your resume. Please try again.");
            }

        } catch (error: any) {
            // Full detail stays in the console. `error.message` here comes only
            // from the safe messages thrown above, never raw library internals.
            console.error("Upload error:", error);
            toast.error(error.message || "Something went wrong processing your file. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // Trigger analysis when resume updates AND we are in analysis mode
    useEffect(() => {
        if (isAnalyzed) {
            runATSAnalysis();
        }
    }, [resume, isAnalyzed]);

    // Persist the finished review once per analysis so it shows up under
    // Dashboard > AI Reviews. Guarded by hasRecorded because runATSAnalysis
    // re-runs on every resume mutation.
    useEffect(() => {
        if (!isAnalyzed || hasRecorded) return;
        // Note: check against undefined rather than falsiness. A resume that
        // genuinely scores 0 is exactly the one worth recording, and `!atsScore`
        // silently skipped it.
        if (atsScore === undefined || !categoryScores || Object.keys(categoryScores).length === 0) return;

        setHasRecorded(true);
        recordAnalysis(resume.title || fileName || "Untitled Resume");
    }, [isAnalyzed, hasRecorded, atsScore, categoryScores, resume.title, fileName, recordAnalysis]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const handleOptimize = () => {
        // Ensure viewMode is set to resume before navigating so the builder
        // opens the resume editor (not the cover letter from a previous session).
        useResumeStore.getState().setViewMode('resume');
        // We do NOT pass resumeId because the freshly parsed resume is already
        // in the store's `resume` field; passing an id would cause the builder
        // to search savedResumes (which may not contain it yet).
        router.push("/builder?mode=edit&tab=resume");
    };

    const handleReset = () => {
        setIsAnalyzed(false);
        setHasRecorded(false);
        setFileName("");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">

            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b p-4 sm:p-6">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <div
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                        onClick={() => router.push('/dashboard')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
                    </div>
                    <h1 className="text-base sm:text-xl font-bold text-center">AI Resume Analysis</h1>
                    <div className="w-8 sm:w-20" />
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">

                {!isAnalyzed ? (
                    // UPLOAD VIEW
                    <div className="flex flex-col items-center justify-center min-h-[50vh]">
                        <div className="text-center mb-8 sm:mb-10 max-w-lg">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Upload your resume</h2>
                            <p className="text-slate-500 text-sm sm:text-base">
                                Get an instant ATS score review and personalized improvement suggestions.
                                Supported formats: PDF, TXT.
                            </p>
                        </div>

                        <div
                            className={`w-full max-w-xl h-56 sm:h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all px-4 text-center
                                ${dragActive ? 'border-primary bg-primary/5' : 'border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-900'}
                            `}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".pdf,.txt,.md"
                                onChange={handleChange}
                            />

                            {isUploading ? (
                                <div className="flex flex-col items-center gap-4 animate-pulse">
                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                    <p className="font-medium text-slate-600">{analysisStep || "Analyzing your resume..."}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="h-14 w-14 sm:h-16 sm:w-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                        <Upload className="w-7 h-7 sm:w-8 sm:h-8" />
                                    </div>
                                    <p className="text-base sm:text-lg font-semibold mb-1">Click to upload or drag &amp; drop</p>
                                    <p className="text-sm text-slate-400">PDF or Text files (max 5MB)</p>
                                </>
                            )}
                        </div>

                        {(savedResumes?.length || 0) > 0 && (
                            <div className="w-full max-w-xl mt-8">
                                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                                    Or analyze a saved resume
                                </h3>
                                <div className="grid gap-3">
                                    {savedResumes.map((r: any, idx: number) => (
                                        <div
                                            key={`${r.id}-${idx}`}
                                            onClick={() => {
                                                setResume(r);
                                                setHasRecorded(false);
                                                setIsAnalyzed(true);
                                                incrementReviewCount();
                                                setFileName(r.title || r.profile?.fullName || "Saved Resume");
                                            }}
                                            className="bg-white dark:bg-slate-900 border rounded-lg p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all flex items-center justify-between gap-3 group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-foreground truncate">
                                                        {r.title || r.profile?.fullName || "Untitled Resume"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {r.profile?.jobTitle || r.experience?.[0]?.title || "No Title"}
                                                    </p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="h-20" />
                    </div>
                ) : (
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
                        onOptimize={handleOptimize}
                        secondaryAction={{ label: "Upload New", onClick: handleReset }}
                    />
                )}

            </main>
        </div>
    );
}
