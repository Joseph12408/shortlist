"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Download, Eye, EyeOff, FileDown, Palette, Crown, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { useRouter } from "next/navigation";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { isTemplateFree } from "@/lib/tiers";

import { THEME_PRESETS } from "@/lib/themes";

interface AIToolbarProps {
    showPreview: boolean;
    onTogglePreview: () => void;
    onExportPdf: () => void;
    onExportDocx: () => void;
    onOptimize: () => void;
    isOptimizing: boolean;
}

export function AIToolbar({ showPreview, onTogglePreview, onExportPdf, onExportDocx, onOptimize, isOptimizing }: AIToolbarProps) {
    // NOTE: this component previously destructured `activeTheme` and `setTheme`,
    // neither of which exists on the store, so the dropdown threw on change.
    // The store's real API is `setTemplate` plus `resume.customStyles`.
    const store = useResumeStore();
    const { resume, setTemplate, viewMode } = store;
    const router = useRouter();
    const { checkFeatureAccess, isPro } = useFeatureAccess();

    // Optional on the store until the first analysis run.
    const atsScore = store.atsScore ?? 0;
    const currentLayout = resume.customStyles?.theme || 'modern';

    // Presets share layouts, so recover the active one by matching its tokens
    // and fall back to the first preset using the current layout.
    const activePreset =
        THEME_PRESETS.find(
            (t) =>
                t.tokens.theme === currentLayout &&
                t.tokens.fontHeading === resume.customStyles?.fontHeading &&
                t.tokens.fontBody === resume.customStyles?.fontBody
        ) ?? THEME_PRESETS.find((t) => t.tokens.theme === currentLayout);

    // Determine score color
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500";
        if (score >= 50) return "text-yellow-500";
        return "text-red-500";
    };

    const handlePresetChange = (presetId: string) => {
        const preset = THEME_PRESETS.find((t) => t.id === presetId);
        if (!preset) return;

        // Presets built on a Pro layout stay locked for free users.
        if (!isTemplateFree(preset.tokens.theme) && !isPro) {
            router.push('/pricing');
            return;
        }

        setTemplate(presetId);
    };

    const handleAIAction = async () => {
        const feature = viewMode === 'cover-letter' ? 'ai_cover_letter' : 'ai_generation';
        if (!checkFeatureAccess(feature)) {
            router.push('/pricing');
            return;
        }
        onOptimize();
    };

    const buttonLabel = isOptimizing ? "Working..." : "Generate";

    return (
        <div className="border-b bg-background/95 backdrop-blur flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 sm:px-6 py-2 lg:h-16 lg:py-0 lg:flex-nowrap sticky top-0 z-20">
            {/* Left: AI Score */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Sparkles className={`w-4 h-4 shrink-0 ${getScoreColor(atsScore)}`} />
                        <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                            AI Score: <span className={getScoreColor(atsScore)}>{atsScore}</span>/100
                        </span>
                    </div>

                    {/* Theme Selector */}
                    <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
                        <div className="relative">
                            <select
                                value={activePreset?.id ?? 'san_francisco'}
                                onChange={(e) => handlePresetChange(e.target.value)}
                                aria-label="Resume theme"
                                className="h-8 w-[140px] sm:w-[180px] pl-2 pr-8 text-xs bg-background border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                            >
                                {THEME_PRESETS.map((theme) => {
                                    const locked = !isTemplateFree(theme.tokens.theme) && !isPro;
                                    return (
                                        <option key={theme.id} value={theme.id}>
                                            {theme.label}{locked ? ' 🔒' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            {/* Custom arrow icon since appearance-none hides it */}
                            <div className="absolute right-2 top-2.5 pointer-events-none">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground w-3 h-3"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>
                    <Progress value={atsScore} className="w-28 sm:w-32 h-2" />
                </div>
                {atsScore < 80 && (
                    <div className="hidden xl:flex text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        💡 Tip: Add more numbers to your experience.
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
                {/* Preview toggle matters most on mobile, where the panes stack. */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onTogglePreview}
                    className="gap-2 px-2 sm:px-3"
                >
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="hidden sm:inline">
                        {showPreview ? "Hide Preview" : "Show Preview"}
                    </span>
                </Button>

                {isPro ? (
                    <Button
                        size="sm"
                        onClick={handleAIAction}
                        disabled={isOptimizing}
                        className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105"
                    >
                        <Sparkles className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
                        {buttonLabel}
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        onClick={() => router.push('/pricing')}
                        className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105"
                    >
                        <Crown className="w-4 h-4" />
                        Generate
                    </Button>
                )}

                <div className="h-4 w-[1px] bg-border mx-1 hidden md:block" />

                {/* DOCX is Pro-only. PDF is available on free with a watermark and
                    a monthly cap, both enforced server-side. */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onExportDocx}
                    className="gap-1.5 px-2 sm:px-3"
                    title="Export as DOCX"
                >
                    {!isPro && <Lock className="w-3 h-3 text-amber-500" />}
                    <FileDown className="w-4 h-4" />
                    <span className="hidden sm:inline">DOCX</span>
                </Button>

                <Button
                    size="sm"
                    onClick={onExportPdf}
                    className="gap-1.5 px-2 sm:px-3 bg-indigo-600 hover:bg-indigo-700 text-white"
                    title={isPro ? 'Export PDF' : 'Export PDF (watermarked)'}
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">
                        {isPro ? 'Export PDF' : 'PDF (watermarked)'}
                    </span>
                    <span className="sm:hidden">PDF</span>
                </Button>
            </div>
        </div>
    );
}
