"use client";

import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { cn } from "@/lib/utils";
import { Lock, Check } from "lucide-react";
import { useState } from "react";
import { UpgradeModal } from "@/components/upgrade-modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Added for router.push

export function TemplateSelector() {
    const {
        selectedTemplate,
        setTemplate,
        subscriptionStatus,
        setColors,
        resume,
        applySelectedTemplate,
        activeTheme, // Added
        setTheme, // Added
        checkFeatureAccess // Added
    } = useResumeStore();
    const { customStyles } = resume;
    const [showUpgrade, setShowUpgrade] = useState(false);
    const router = useRouter(); // Added for router.push

    // Check if the current preview matches the saved theme
    // We need to be careful with theme case/defaults logic, but generally they should match
    const isUnsaved = selectedTemplate !== (customStyles?.theme || 'modern');

    const templates = [
        { id: 'standard', name: 'Standard (Best)', color: 'bg-stone-50 border-2 border-stone-800', premium: false },
        { id: 'sidebar', name: 'Creative Left', color: 'bg-blue-100 border-l-4 border-blue-500', premium: false },
        { id: 'sidebar_right', name: 'Creative Right', color: 'bg-green-100 border-r-4 border-green-500', premium: false },
        { id: 'banner', name: 'Executive Banner', color: 'bg-slate-100 border-t-4 border-slate-700', premium: false },
        { id: 'efficient', name: 'Efficient', color: 'bg-blue-50', premium: false },
        { id: 'classic', name: 'Classic', color: 'bg-slate-200', premium: false },
        { id: 'modern', name: 'Modern', color: 'bg-indigo-900', premium: true },
        { id: 'minimal', name: 'Minimal', color: 'bg-white border', premium: true },
    ];

    const handleSelect = (id: any, premium: boolean) => {
        if (premium && subscriptionStatus === 'free') {
            setShowUpgrade(true);
            return;
        }
        setTemplate(id);
    };

    return (
        <>
            <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
            <div className="grid gap-8">
                <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Choose Template</Label>
                        <Button
                            onClick={applySelectedTemplate}
                            disabled={!isUnsaved}
                            size="sm"
                            className={cn(
                                "transition-all duration-300",
                                isUnsaved
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg hover:scale-105"
                                    : "bg-green-100 text-green-700 hover:bg-green-100 opacity-100"
                            )}
                        >
                            {!isUnsaved ? (
                                <>
                                    <Check className="w-4 h-4 mr-1" />
                                    Applied
                                </>
                            ) : (
                                "Apply Template"
                            )}
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {templates.map((t) => (
                            <div key={t.id} onClick={() => handleSelect(t.id, t.premium)}>
                                <div
                                    className={cn(
                                        "relative flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                                        selectedTemplate === t.id && "border-primary bg-primary/5 ring-2 ring-primary/20",
                                        // Visual indicator for SAVED theme
                                        (customStyles?.theme === t.id) && "border-green-500/50 bg-green-50/30"
                                    )}
                                >
                                    <div className={cn("w-full h-16 rounded mb-2 shadow-sm", t.color)} />
                                    <span className="text-xs font-medium">{t.name}</span>
                                    {t.premium && subscriptionStatus === 'free' && (
                                        <div className="absolute top-1 right-1 bg-background/80 rounded-full p-1">
                                            <Lock className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                    )}

                                    {/* Saved Badge */}
                                    {customStyles?.theme === t.id && (
                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-sm">
                                            Active
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4">
                    <Label className="text-base font-semibold">Accent Color</Label>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { name: 'Light Blue', value: '#3B82F6', class: 'bg-blue-500' },
                            { name: 'Dark Blue', value: '#1e3a8a', class: 'bg-blue-900' },
                            { name: 'Dirty Green', value: '#064e3b', class: 'bg-emerald-900' },
                            { name: 'Coffee Brown', value: '#451a03', class: 'bg-orange-950' },
                            { name: 'Gray/Black', value: '#111827', class: 'bg-gray-900' },
                        ].map((c) => (
                            <button
                                key={c.name}
                                onClick={() => setColors(c.value, c.value)}
                                className={cn(
                                    "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                    customStyles?.accentColor === c.value ? "border-primary scale-110" : "border-transparent",
                                    c.class
                                )}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
