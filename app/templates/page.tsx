"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { useRouter } from "next/navigation";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TemplatesPage() {
    const { setTemplate, subscriptionStatus, selectedTemplate } = useResumeStore();
    const router = useRouter();

    const templates = [
        {
            id: 'classic',
            name: 'Classic',
            description: 'Traditional layout, perfect for corporate roles.',
            color: 'bg-slate-100',
            premium: false
        },
        {
            id: 'modern',
            name: 'Modern',
            description: 'Two-column design with a touch of color.',
            color: 'bg-indigo-50',
            premium: true
        },
        {
            id: 'minimal',
            name: 'Minimal',
            description: 'Clean, centered, and whitespace extraction.',
            color: 'bg-white border',
            premium: true
        },
    ];

    const handleSelect = (id: string, premium: boolean) => {
        setTemplate(id as 'classic' | 'modern' | 'minimal');
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
                                    Use Template
                                </Button>
                            </div>
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
