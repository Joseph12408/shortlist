"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { useReactToPrint } from "react-to-print";
import { generateDocx } from "@/lib/export/generate-docx";
import { useResumePersistence } from "@/hooks/use-resume-persistence";
import { useSearchParams } from "next/navigation";

// Components
import { ResumeForm } from "@/components/builder/resume-form";
import { AIToolbar } from "@/components/builder/ai-toolbar";
import { AILanding } from "@/components/builder/ai-landing";
import { UpgradeModal } from "@/components/upgrade-modal";

// Dynamic import to avoid SSR issues with DOMMatrix (used by react-to-print)
const ResumePreview = dynamic(
    () => import("@/components/builder/resume-preview").then(mod => mod.ResumePreview),
    { ssr: false, loading: () => <div className="w-[210mm] min-h-[297mm] bg-white animate-pulse" /> }
);

function BuilderContent() {
    // 1. Init Persistence & Store
    useResumePersistence();
    const {
        resume,
        subscriptionStatus,
        isLoading,
        isPreviewVisible,
        setPreviewVisible,
        loadResume,
        loadCoverLetter,
        setViewMode,
        savedResumes // Need this for dependency tracking
    } = useResumeStore();

    // 2. Local State
    const searchParams = useSearchParams();
    const [viewState, setViewState] = useState<'landing' | 'editor'>('landing');
    const [showUpgrade, setShowUpgrade] = useState(false);

    // 3. Print Logic
    const contentRef = useRef<HTMLDivElement>(null);
    const useReactToPrintFn = useReactToPrint({ contentRef });

    // 4. Effects
    // Handle URL Params (e.g. ?tab=cover-letter, ?resumeId=..., ?coverLetterId=...)
    useEffect(() => {
        const tab = searchParams.get('tab');
        const mode = searchParams.get('mode');
        const resumeId = searchParams.get('resumeId');
        const coverLetterId = searchParams.get('coverLetterId');

        // Handle Resume Loading
        if (resumeId) {
            console.log("BuilderPage: Loading resumeId:", resumeId);
            // Check if we already loaded it to prevent loop
            const currentResume = useResumeStore.getState().resume;
            if (currentResume.id === resumeId) {
                console.log("BuilderPage: Resume already loaded.");
                setViewState('editor');
                return;
            }

            const store = useResumeStore.getState();
            // Explicitly call with state to debug
            const found = store.savedResumes.find(r => r.id === resumeId);
            if (found) {
                console.log("BuilderPage: Found resume:", found.title);
                loadResume(resumeId);
                setViewState('editor');
            } else {
                console.warn("BuilderPage: Resume ID not found in savedResumes (yet?)");
            }
        }

        // Handle Cover Letter Loading
        if (coverLetterId) {
            loadCoverLetter(coverLetterId);
            setViewState('editor');
        }

        // Handle Tab Switching
        if (tab === 'cover-letter') {
            setViewMode('cover-letter');
            setViewState('editor'); // Skip landing for cover letter
        } else if (tab === 'resume') {
            setViewMode('resume');
        }

        // Handle explicit Edit Mode
        if (mode === 'edit') {
            setViewState('editor');
        }
    }, [searchParams, setViewMode, loadResume, loadCoverLetter, savedResumes.length]); // Add savedResumes.length dependency to retry on hydration

    // If resume has data (e.g. from persistence), skip landing
    useEffect(() => {
        // Only auto-switch if we are NOT in a specific loading mode (to avoid jumping around)
        const hasUrlParams = searchParams.get('mode') === 'edit' || searchParams.get('resumeId') || searchParams.get('coverLetterId');

        if (!hasUrlParams && (resume?.profile?.fullName || (resume?.experience?.length || 0) > 0)) {
            // Logic to auto-skip landing if we have a draft but no explicit intent
            // For now, let's keep it manual or based on 'mode' to be safe.
            // setViewState('editor'); 
        }
    }, [resume, searchParams]);

    // 5. Handlers
    const handleExportPdf = async () => {
        try {
            const store = useResumeStore.getState();

            // Usage Limit Check
            try {
                store.incrementExport();
            } catch (e) {
                setShowUpgrade(true);
                return;
            }

            const { viewMode, resume, coverLetter } = store;

            let endpoint = '/api/download-pdf';
            let bodyData: any = {};

            if (viewMode === 'cover-letter') {
                endpoint = '/api/download-cover-letter';
                bodyData = { coverLetter };
            } else {
                endpoint = '/api/download-pdf';
                bodyData = { resume };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error === 'usage_limit_reached') {
                    setShowUpgrade(true);
                    return;
                }
                throw new Error(errorData.error || 'Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = viewMode === 'cover-letter' ? 'cover_letter.pdf' : 'resume.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Export failed:', error);
            // If it was the limit error specifically, we handled it above, 
            // but if something else failed, we alert.
            // We can differentiate usage limit vs server error if needed.
            alert(`Export Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleExportDocx = async () => {
        try {
            // Usage Limit Check for DOCX too (shared limit)
            useResumeStore.getState().incrementExport();
            await generateDocx(resume);
        } catch (e: any) {
            if (e.message?.includes("limit reached")) {
                setShowUpgrade(true);
            } else {
                alert("Export Failed: " + e.message);
            }
        }
    };

    const handleLandingComplete = () => {
        setViewState('editor');
    };

    const handleOptimize = () => {
        const { viewMode, improveResumeWithAI, generateCoverLetterWithAI } = useResumeStore.getState();

        if (viewMode === 'cover-letter') {
            generateCoverLetterWithAI();
        } else {
            improveResumeWithAI();
        }
    };

    // --- Render ---

    // A. Landing State
    if (viewState === 'landing') {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col">
                <AILanding onComplete={handleLandingComplete} />
            </div>
        );
    }

    // B. Editor State
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-muted/20">
            <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />

            {/* Top Toolbar */}
            <AIToolbar
                showPreview={isPreviewVisible}
                onTogglePreview={() => setPreviewVisible(!isPreviewVisible)}
                onExportDocx={handleExportDocx}
                onExportPdf={handleExportPdf}
                onOptimize={handleOptimize}
                isOptimizing={isLoading}
            />

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Editor Form (Always visible, expands if preview hidden) */}
                <div className={`
                    border-r bg-background overflow-y-auto custom-scrollbar transition-all duration-300
                    ${isPreviewVisible ? 'w-1/2' : 'w-full max-w-5xl mx-auto border-r-0'}
                `}>
                    <ResumeForm />
                </div>

                {/* Right: Live Preview (Hidden if toggled) */}
                {isPreviewVisible && (
                    <div className="w-1/2 bg-muted/40 overflow-y-auto flex justify-center p-8">
                        <div className="scale-[0.85] origin-top">
                            <div ref={contentRef} className="shadow-2xl">
                                <ResumePreview />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { Suspense } from "react";

export default function BuilderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading builder...</div>}>
            <BuilderContent />
        </Suspense>
    );
}
