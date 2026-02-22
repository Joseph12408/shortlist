"use client";

import { useState } from "react";
import { Sparkles, Palette, Zap, Briefcase, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useResumeStore } from "@/lib/store/useResumeStore";



export function StylePromptInput() {
    const { stylePrompt, setStylePrompt } = useResumeStore();

    return (
        <Card className="p-4 border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">AI Design Studio</h3>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
                Describe your target vibe, role, or aesthetic. The AI Design Engine will generate a unique layout, color palette, and typography system for you.
            </p>

            {/* Custom Input */}
            <Textarea
                placeholder="e.g. 'Senior Legal Counsel, authoritative, Serif typography, navy and cream' or 'Cyberpunk Frontend Dev, neon green, dark mode'"
                value={stylePrompt}
                onChange={(e) => {
                    setStylePrompt(e.target.value);
                }}
                className="min-h-[80px] text-sm resize-none border-primary/20"
            />
        </Card>
    );
}
