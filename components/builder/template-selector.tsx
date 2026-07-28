"use client";

import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

import { useRouter } from "next/navigation";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { isTemplateFree } from "@/lib/tiers";

export function TemplateSelector() {
    // NOTE: `subscriptionStatus` and `applySelectedTemplate` were destructured
    // here but never existed on the store. Tier now comes from useFeatureAccess
    // and setTemplate applies immediately, so no Apply button is needed.
    const { setTemplate, setColors, resume } = useResumeStore();
    const { customStyles } = resume;
    const currentTheme = customStyles?.theme || 'modern';

    const router = useRouter();
    const { isPro } = useFeatureAccess();

    // Tier comes from lib/tiers so this list and /templates cannot drift apart.
    const templates = [
        { id: 'standard', name: 'Standard (Best)', color: 'bg-stone-50 border-2 border-stone-800' },
        { id: 'sidebar', name: 'Creative Left', color: 'bg-blue-100 border-l-4 border-blue-500' },
        { id: 'sidebar_right', name: 'Creative Right', color: 'bg-green-100 border-r-4 border-green-500' },
        { id: 'banner', name: 'Executive Banner', color: 'bg-slate-100 border-t-4 border-slate-700' },
        { id: 'efficient', name: 'Efficient', color: 'bg-blue-50' },
        { id: 'classic', name: 'Classic', color: 'bg-slate-200' },
        { id: 'modern', name: 'Modern', color: 'bg-indigo-900' },
        { id: 'minimal', name: 'Minimal', color: 'bg-white border' },
    ].map((t) => ({ ...t, premium: !isTemplateFree(t.id) }));

    const handleSelect = (id: string, premium: boolean) => {
        if (premium && !isPro) {
            router.push('/pricing');
            return;
        }
        setTemplate(id);
    };

    return (
        <>

            <div className="grid gap-8">
                <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Choose Template</Label>
                        {!isPro && (
                            <span className="text-xs text-muted-foreground">
                                {templates.filter((t) => t.premium).length} locked on Free
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {templates.map((t) => (
                            <div key={t.id} onClick={() => handleSelect(t.id, t.premium)}>
                                <div
                                    className={cn(
                                        "relative flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                                        currentTheme === t.id && "border-primary bg-primary/5 ring-2 ring-primary/20",
                                        // Visual indicator for SAVED theme
                                        (customStyles?.theme === t.id) && "border-green-500/50 bg-green-50/30"
                                    )}
                                >
                                    <div className={cn("w-full h-16 rounded mb-2 shadow-sm", t.color)} />
                                    <span className="text-xs font-medium">{t.name}</span>
                                    {t.premium && !isPro && (
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
