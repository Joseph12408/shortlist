"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { useReactToPrint } from "react-to-print";
import { generateDocx } from "@/lib/export/generate-docx";
import { useResumePersistence } from "@/hooks/use-resume-persistence";
import { useSearchParams, useRouter } from "next/navigation";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { toast } from "@/lib/toast";

// Components
import { ResumeForm } from "@/components/builder/resume-form";
import { AIToolbar } from "@/components/builder/ai-toolbar";
import { AILanding } from "@/components/builder/ai-landing";


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
    const router = useRouter();
    const { isPro } = useFeatureAccess();
    const [viewState, setViewState] = useState<'landing' | 'editor'>('landing');

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
            // Fresh visit with no params, reset for a clean landing page.
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
            const store = useResumeStore.getState();
            const { viewMode, resume, coverLetter } = store;

            // Cover letter export is Pro-only. Resume PDF is available on free
            // with a watermark and a monthly cap. The server enforces both, so
            // we let the request through and handle a 402 if the cap is hit.
            if (viewMode === 'cover-letter' && !isPro) {
                router.push('/pricing');
                return;
            }

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
                const errorData = await response.json().catch(() => ({}));
                if (errorData.error === 'usage_limit_reached' || errorData.error === 'pro_required') {
                    toast.error(errorData.message || 'You have reached your export limit for this month.');
                    router.push('/pricing');
                    return;
                }
                // errorData.error is already a user-safe message from the API route.
                toast.error(errorData.error || 'Something went wrong exporting your PDF. Please try again.');
                return;
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
            // Full detail stays in the console for debugging. Users only see a
            // plain, actionable message, never the raw exception.
            console.error('Export failed:', error);
            toast.error('Something went wrong exporting your PDF. Please try again.');
        }
    };

    const handleExportDocx = async () => {
        try {
            if (!isPro) {
                router.push('/pricing');
                return;
            }
            await generateDocx(resume);
        } catch (error) {
            console.error('DOCX export failed:', error);
            toast.error('Something went wrong exporting your DOCX. Please try again.');
        }
    };

    const handleLandingComplete = () => {
        setViewState('editor');
    };

    const handleOptimize = () => {
        if (!isPro) {
            router.push('/pricing');
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


            <AIToolbar
                showPreview={isPreviewVisible ?? false}
                onTogglePreview={() => setPreviewVisible(!isPreviewVisible)}
                onExportDocx={handleExportDocx}
                onExportPdf={handleExportPdf}
                onOptimize={handleOptimize}
                isOptimizing={isLoading}
            />

            {/* Below lg the panes stack and only one is shown at a time: two
                side-by-side columns on a phone leave neither usable. The toolbar
                toggle switches between editing and previewing. */}
            <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
                <div
                    className={`
                        bg-background overflow-y-auto custom-scrollbar transition-all duration-300
                        ${isPreviewVisible
                            ? 'hidden lg:block lg:w-1/2 lg:border-r'
                            : 'block w-full lg:max-w-5xl lg:mx-auto'}
                    `}
                >
                    <ResumeForm />
                </div>

                {isPreviewVisible && (
                    <div className="flex-1 lg:w-1/2 bg-muted/40 overflow-y-auto overflow-x-hidden flex justify-center p-4 sm:p-6 lg:p-8">
                        <div className="resume-preview-scaler">
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
