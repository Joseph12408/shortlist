"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Download, Eye, EyeOff, LayoutTemplate, FileDown, Palette, Crown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { useRouter } from "next/navigation";
import { useFeatureAccess } from "@/hooks/use-feature-access";

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
    const { atsScore, activeTheme, setTheme, viewMode, generateCoverLetterWithAI, improveResumeWithAI } = useResumeStore();
    const router = useRouter(); 
    const { checkFeatureAccess, isPro } = useFeatureAccess(); 

    // Determine score color
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500";
        if (score >= 50) return "text-yellow-500";
        return "text-red-500";
    };

    const handleAIAction = async () => { // Renamed handleAction to handleAIAction for clarity
        if (!checkFeatureAccess('ai_write')) {
            router.push('/pricing');
            return;
        }

        if (viewMode === 'cover-letter') {
            await generateCoverLetterWithAI(); // Added await
        } else {
            await improveResumeWithAI(); // Changed from onOptimize to improveResumeWithAI and added await
        }
    };

    const handleExportPdfWithCheck = () => { // New function for export with potential checks
        // We'll handle export limits in the main page handler, 
        // but we could also check here if we wanted to disable the button.
        // For now, let the click propagate to the parent handler which has the toast/alert logic.
        onExportPdf();
    };

    const buttonLabel = isOptimizing ? "Working..." : "Generate";

    return (
        <div className="h-16 border-b bg-background/95 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-20">
            {/* Left: AI Score */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className={`w-4 h-4 ${getScoreColor(atsScore)}`} />
                        <span className="text-sm font-semibold text-foreground">
                            AI Score: <span className={getScoreColor(atsScore)}>{atsScore}</span>/100
                        </span>
                    </div>

                    {/* Middle: Theme Selector */}
                    <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-muted-foreground" />
                        <div className="relative">
                            <select
                                value={activeTheme || 'san_francisco'}
                                onChange={(e) => setTheme(e.target.value)}
                                className="h-8 w-[180px] pl-2 pr-8 text-xs bg-background border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                            >
                                {THEME_PRESETS.map((theme) => (
                                    <option key={theme.id} value={theme.id}>
                                        {theme.label}
                                    </option>
                                ))}
                            </select>
                            {/* Custom arrow icon since appearance-none hides it */}
                            <div className="absolute right-2 top-2.5 pointer-events-none">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground w-3 h-3"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>
                    <Progress value={atsScore} className="w-32 h-2" />
                </div>
                {atsScore < 80 && (
                    <div className="hidden md:flex text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        💡 Tip: Add more numbers to your experience.
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onTogglePreview}
                    className="hidden md:flex gap-2"
                >
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPreview ? "Hide Preview" : "Show Preview"}
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
                        onClick={onOptimize}
                        className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105"
                    >
                        <Crown className="w-4 h-4" />
                        Generate
                    </Button>
                )}

                <div className="h-4 w-[1px] bg-border mx-2 hidden md:block" />

                <Button variant="outline" size="sm" onClick={() => { if (!isPro) { router.push('/pricing'); return; } onExportDocx(); }} className="gap-2">
                    {!isPro && <Crown className="w-3 h-3 text-amber-500" />}
                    <FileDown className="w-4 h-4" />
                    DOCX
                </Button>

                <Button size="sm" onClick={() => { if (!isPro) { router.push('/pricing'); return; } onExportPdf(); }} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    {!isPro && <Crown className="w-3 h-3 text-amber-300" />}
                    <Download className="w-4 h-4" />
                    Export PDF
                </Button>
            </div>
        </div>
    );
}
