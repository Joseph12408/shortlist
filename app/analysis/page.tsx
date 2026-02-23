"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Upload, Sparkles, CheckCircle2, AlertCircle, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";


export default function AnalysisPage() {
    const { resume, savedResumes, atsScore, atsFeedback, runATSAnalysis, missingKeywords, setResume, setJobDescription, incrementReviewCount } = useResumeStore();
    const router = useRouter();

    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const [fileName, setFileName] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(""); // For progress feedback

    // Initial analysis if resume exists and likely came from builder navigation?
    // Actually, user wants "Upload -> Analyze", so we default to Upload view unless we just parsed one.
    // However, if they came from "Get AI Review" on Dashboard, they might want to review CURRENT resume.
    // We can show a tab or simple "Review Current" vs "Upload New".
    // For simplicity based on prompt: "users are suppose to upload a resume".
    // I'll make Upload the default, but maybe add a "Use Current Builder Resume" button?

    // Let's stick to the prompt: Main focus is Upload.

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
            console.error("PDF Parse Error:", error);
            // Check for specific worker errors
            if (error.name === 'MissingPDFException') {
                throw new Error("Invalid PDF file.");
            }
            if (error.message?.includes('worker')) {
                throw new Error("PDF Worker failed to load. Please check your internet connection.");
            }
            throw new Error(error.message || "Failed to parse PDF");
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
                // Set the resume with the filename as title
                const newResume = { ...data.resume, title: file.name };
                setResume(newResume);
                // Force save to current draft persistence immediately to be safe
                // useResumeStore.getState().saveCurrentResume(); // Optional: if we want to save to "savedResumes" list immediately

                setIsAnalyzed(true);
                incrementReviewCount();
            } else {
                alert("Failed to parse resume: " + data.error);
            }

        } catch (error: any) {
            console.error("Upload error:", error);
            alert(`Error processing file: ${error.message || "Unknown error"}`);
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
        if (resume && resume.id) {
            router.push(`/builder?mode=edit&resumeId=${resume.id}`);
        } else {
            router.push("/builder?mode=edit");
        }
    };

    const handleReset = () => {
        setIsAnalyzed(false);
        setFileName("");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">

            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b p-6">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Dashboard</span>
                    </div>
                    <h1 className="text-xl font-bold">AI Resume Analysis</h1>
                    <div className="w-20"></div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">

                {!isAnalyzed ? (
                    // UPLOAD VIEW
                    <div className="flex flex-col items-center justify-center min-h-[50vh]">
                        <div className="text-center mb-10 max-w-lg">
                            <h2 className="text-3xl font-bold mb-4">Upload your resume</h2>
                            <p className="text-slate-500">
                                Get an instant ATS score review and personalized improvement suggestions.
                                Supported formats: PDF, TXT.
                            </p>
                        </div>

                        <div
                            className={`w-full max-w-xl h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all
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
                                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <p className="text-lg font-semibold mb-1">Click to upload or drag & drop</p>
                                    <p className="text-sm text-slate-400">PDF or Text files (max 5MB)</p>
                                </>
                            )}
                        </div>

                        <div className="mt-8 flex gap-4">
                            <p className="text-sm text-slate-400">Or</p>
                        </div>


                        {(savedResumes?.length || 0) > 0 && (
                            <div className="w-full max-w-xl mt-8">
                                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Or analyze a saved resume</h3>
                                <div className="grid gap-3">
                                    {savedResumes.map((r, idx) => (
                                        <div
                                            key={`${r.id}-${idx}`}
                                            onClick={() => {
                                                // Check Feature Access
                                                if (!useResumeStore.getState().checkFeatureAccess('analyze_edit')) {
                                                    // For now, we can redirect to upgrade or show an alert.
                                                    // Since we don't have a modal on this page easily accessible without refactoring,
                                                    // let's redirect to upgrade page.
                                                    window.location.href = '/upgrade';
                                                    return;
                                                }

                                                setResume(r);
                                                setIsAnalyzed(true);
                                                incrementReviewCount(); // Count this as a review
                                                setFileName(r.profile.fullName || "Saved Resume");
                                            }}
                                            className="bg-white dark:bg-slate-900 border rounded-lg p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{r.profile.fullName || "Untitled Resume"}</p>
                                                    <p className="text-xs text-muted-foreground">{r.profile.jobTitle || "No Title"} • Last updated {new Date().toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="h-20"></div> {/* Spacer */}

                    </div>
                ) : (
                    // ANALYSIS VIEW (Existing Logic)
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold">Analysis Results for {resume.title || fileName || "Current Resume"}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-slate-500">Last updated just now</p>
                                    {atsScore >= 92 && (
                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            Best Rated
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Button variant="outline" onClick={handleReset}>
                                Upload New
                            </Button>
                        </div>

                        {/* Score Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {/* Main Score Card */}
                            <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border p-8 flex flex-col items-center justify-center text-center">
                                <div className="text-lg font-medium text-muted-foreground mb-4">Overall Score</div>
                                <div className={`text-6xl font-black mb-4 ${atsScore >= 80 ? 'text-green-500' : atsScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                    {atsScore}
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                                    <div className={`h-full ${atsScore >= 80 ? 'bg-green-500' : atsScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${atsScore}%` }}></div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {atsScore >= 80 ? "Your resume is ready for applications!" : "There is room for improvement."}
                                </p>
                            </div>

                            {/* Category Breakdown */}
                            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border p-8">
                                <h3 className="text-xl font-bold mb-6">Score Breakdown</h3>
                                <div className="space-y-6">
                                    {useResumeStore.getState().categoryScores && Object.values(useResumeStore.getState().categoryScores).map((cat) => (
                                        <div key={cat.name}>
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium">{cat.name}</span>
                                                <span className="text-muted-foreground">{cat.score}/{cat.maxScore}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${cat.score === cat.maxScore ? 'bg-green-500' : cat.score > cat.maxScore / 2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {cat.score === cat.maxScore ? 'Excellent' : 'Needs attention'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions CTA - RESTORED */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Ready to improve your score?</h2>
                                <p className="text-indigo-100 max-w-xl">
                                    We've analyzed your resume. Click below to open it in our advanced builder with all your data pre-loaded, and start fixing the issues.
                                </p>
                            </div>
                            <Button size="lg" variant="secondary" className="shrink-0 gap-2 font-semibold" onClick={handleOptimize}>
                                <Sparkles className="w-4 h-4" />
                                Edit & Optimize in Builder
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Detailed Feedback Grouped by Category */}
                        <div className="space-y-8">
                            <h3 className="text-2xl font-bold">Detailed Feedback</h3>

                            {(missingKeywords?.length || 0) > 0 && (
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/30 p-6 flex gap-4">
                                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg h-fit text-red-600">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-red-900 dark:text-red-400 mb-1">Missing Keywords</h4>
                                        <p className="text-sm text-muted-foreground mb-3">Your resume is missing some key terms commonly found in job descriptions.</p>
                                        <div className="flex flex-wrap gap-2">
                                            {missingKeywords.map((k, idx) => (
                                                <span key={`${k}-${idx}`} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-md border border-red-100 dark:border-red-900/30">
                                                    {k}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Render feedback grouped by category if available */}
                            {useResumeStore.getState().categoryScores ? (
                                Object.values(useResumeStore.getState().categoryScores).map((cat) => (
                                    (cat.feedback?.length || 0) > 0 && (
                                        <div key={cat.name} className="space-y-4">
                                            <h4 className="text-lg font-semibold border-b pb-2">{cat.name}</h4>
                                            {cat.feedback.map((item, i) => (
                                                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border p-6 flex gap-4">
                                                    <div className={`p-2 rounded-lg h-fit text-white shrink-0 ${item.type === 'error' ? 'bg-red-500' : item.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                                                        {item.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-700 dark:text-slate-300">{item.message}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                ))
                            ) : (
                                // Fallback for old feedback structure
                                atsFeedback?.map((item, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border p-6 flex gap-4">
                                        <div className={`p-2 rounded-lg h-fit text-white ${item.type === 'error' ? 'bg-red-500' : item.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                                            {item.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-1 capitalize">{item.category}</h4>
                                            <p className="text-sm text-muted-foreground">{item.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )
                }

            </main >
        </div >
    );
}
