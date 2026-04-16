"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { useReactToPrint } from "react-to-print";
import { generateDocx } from "@/lib/export/generate-docx";
import { useResumePersistence } from "@/hooks/use-resume-persistence";
import { useSearchParams } from "next/navigation";
import { useFeatureAccess } from "@/hooks/use-feature-access";

// Components
import { ResumeForm } from "@/components/builder/resume-form";
import { AIToolbar } from "@/components/builder/ai-toolbar";
import { AILanding } from "@/components/builder/ai-landing";
import { UpgradeModal } from "@/components/upgrade-modal";

const ResumePreview = dynamic(
    () => import("@/components/builder/resume-preview").then(mod => mod.ResumePreview),
    { ssr: false, loading: () => <div className="w-[210mm] min-h-[297mm] bg-white animate-pulse" /> }
);

function BuilderContent() {
    useResumePersistence();
    const {
        resume,
        isLoading,
        isPreviewVisible,
        setPreviewVisible,
        loadResume,
        loadCoverLetter,
        setViewMode,
        resetBuilderSession,
    } = useResumeStore();

    const searchParams = useSearchParams();
    const { isPro } = useFeatureAccess();
    const [viewState, setViewState] = useState<'landing' | 'editor'>('landing');
    const [showUpgrade, setShowUpgrade] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const useReactToPrintFn = useReactToPrint({ contentRef });

    // ─── SESSION LIFECYCLE ────────────────────────────────────────
    // On mount: determine how the user got here and set up accordingly.
    // On unmount: discard session data so the next visit starts clean.
    useEffect(() => {
        const mode = searchParams.get('mode');
        const tab = searchParams.get('tab');
        const coverLetterId = searchParams.get('coverLetterId');

        if (mode === 'edit') {
            const resumeId = searchParams.get('resumeId');

            if (resumeId) {
                loadResume(resumeId);
            }

            if (tab === 'resume') {
                setViewMode('resume');
            } else if (tab === 'cover-letter') {
                setViewMode('cover-letter');
            }
            setViewState('editor');
        } else if (coverLetterId) {
            loadCoverLetter(coverLetterId);
            setViewMode('cover-letter');
            setViewState('editor');
        } else {
            // Fresh visit with no params — reset for a clean landing page.
            resetBuilderSession();
            setViewState('landing');
        }

        // NOTE: No unmount cleanup. The reset-on-mount for fresh visits
        // is sufficient. Unmount cleanup was causing race conditions where
        // data set by the Analysis page would get wiped during navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── HANDLERS ─────────────────────────────────────────────────
    const handleExportPdf = async () => {
        try {
            if (!isPro) {
                setShowUpgrade(true);
                return;
            }

            const store = useResumeStore.getState();
            const { viewMode, resume, coverLetter } = store;

            let endpoint = '/api/download-pdf';
            let bodyData: any = {};

            if (viewMode === 'cover-letter') {
                endpoint = '/api/download-cover-letter';
                bodyData = { coverLetter, resume };
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
            const baseName = viewMode === 'cover-letter'
                ? (coverLetter?.jobTitle || 'cover-letter')
                : (resume?.profile?.fullName || 'resume');
            const fileName = `${baseName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleExportDocx = async () => {
        try {
            if (!isPro) {
                setShowUpgrade(true);
                return;
            }
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
        if (!isPro) {
            setShowUpgrade(true);
            return;
        }

        const { viewMode, improveResumeWithAI, generateCoverLetterWithAI } = useResumeStore.getState();

        if (viewMode === 'cover-letter') {
            generateCoverLetterWithAI();
        } else {
            improveResumeWithAI();
        }
    };

    // ─── RENDER ───────────────────────────────────────────────────

    if (viewState === 'landing') {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col">
                <AILanding onComplete={handleLandingComplete} />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-muted/20">
            <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />

            <AIToolbar
                showPreview={isPreviewVisible}
                onTogglePreview={() => setPreviewVisible(!isPreviewVisible)}
                onExportDocx={handleExportDocx}
                onExportPdf={handleExportPdf}
                onOptimize={handleOptimize}
                isOptimizing={isLoading}
            />

            <div className="flex flex-1 overflow-hidden">
                <div className={`
                    border-r bg-background overflow-y-auto custom-scrollbar transition-all duration-300
                    ${isPreviewVisible ? 'w-1/2' : 'w-full max-w-5xl mx-auto border-r-0'}
                `}>
                    <ResumeForm />
                </div>

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

export default function BuilderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading builder...</div>}>
            <BuilderContent />
        </Suspense>
    );
}
