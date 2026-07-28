"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { isTemplateFree } from "@/lib/tiers";

export default function TemplatesPage() {
    // NOTE: `subscriptionStatus` was read from the store but never defined there.
    // Tier now comes from useFeatureAccess, and the premium flag is derived from
    // lib/tiers so this page cannot disagree with the in-builder selector.
    const { setTemplate } = useResumeStore();
    const router = useRouter();
    const { isPro } = useFeatureAccess();

    const templates = [
        {
            id: 'standard',
            name: 'Standard',
            description: 'ATS-safe single column. The most reliably parsed layout.',
            color: 'bg-stone-50',
        },
        {
            id: 'classic',
            name: 'Classic',
            description: 'Traditional layout, perfect for corporate roles.',
            color: 'bg-slate-100',
        },
        {
            id: 'minimal',
            name: 'Minimal',
            description: 'Clean, centered, and whitespace forward.',
            color: 'bg-white border',
        },
        {
            id: 'modern',
            name: 'Modern',
            description: 'Two-column design with a touch of color.',
            color: 'bg-indigo-50',
        },
        {
            id: 'efficient',
            name: 'Efficient',
            description: 'Dense two-column layout that fits more on one page.',
            color: 'bg-blue-50',
        },
        {
            id: 'banner',
            name: 'Executive Banner',
            description: 'Bold header band for senior and client-facing roles.',
            color: 'bg-slate-100',
        },
    ].map((t) => ({ ...t, premium: !isTemplateFree(t.id) }));

    // Previously this ignored `premium` entirely, letting free users apply
    // Pro templates straight from this page.
    const handleSelect = (id: string, premium: boolean) => {
        if (premium && !isPro) {
            router.push("/pricing");
            return;
        }
        setTemplate(id);
        router.push("/builder");
    };

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-heading mb-4">Choose Your Template</h1>
                <p className="text-muted-foreground text-lg">Select a design that fits your style and industry.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {templates.map((t) => (
                    <Card key={t.id} className="relative group overflow-hidden border-2 transition-all hover:border-primary">
                        <div className={cn("h-64 w-full flex items-center justify-center bg-muted/20", t.color)}>
                            {/* Placeholder for template image - using text for now */}
                            <span className="text-2xl font-bold opacity-20 uppercase tracking-widest">{t.name}</span>

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button onClick={() => handleSelect(t.id, t.premium)}>
                                    {t.premium && !isPro ? 'Unlock with Pro' : 'Use Template'}
                                </Button>
                            </div>

                            {t.premium && !isPro && (
                                <div className="absolute top-3 right-3 bg-background/90 rounded-full p-1.5 shadow-sm">
                                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-xl">{t.name}</h3>
                                {t.premium ? (
                                    <Badge variant="secondary"><Lock className="w-3 h-3 mr-1" /> Pro</Badge>
                                ) : (
                                    <Badge variant="outline">Free</Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{t.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
