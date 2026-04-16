"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Sparkles, Loader2 } from "lucide-react";
import React from 'react';
import { useRouter } from "next/navigation";

export function CoverLetterForm() {
    const {
        coverLetter,
        updateCoverLetter,
        generateCoverLetterWithAI,
        isLoading
    } = useResumeStore();
    const [isGenerating, setIsGenerating] = React.useState(false); // This state might become redundant if generateCoverLetterWithAI handles loading internally
    const router = useRouter(); // Initialize useRouter

    const handleGenerate = async () => {
        // AI Generation is now handled via the global AI Toolbar.
        // This function might be removed or repurposed later.
    };

    return (
        <div className="grid gap-4 p-4 border rounded-lg bg-card">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Cover Letter Details</h3>
                {/* AI Generation is triggered via main toolbar now */}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="title">Cover Letter Name</Label>
                <Input
                    id="title"
                    placeholder="My Cover Letter"
                    value={coverLetter.title || ''}
                    onChange={(e) => updateCoverLetter({ title: e.target.value })}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                    id="jobTitle"
                    placeholder="Software Engineer"
                    value={coverLetter.jobTitle}
                    onChange={(e) => updateCoverLetter({ jobTitle: e.target.value })}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                    id="company"
                    placeholder="Acme Corp"
                    value={coverLetter.company}
                    onChange={(e) => updateCoverLetter({ company: e.target.value })}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="recipient">Hiring Manager / Recipient</Label>
                <Input
                    id="recipient"
                    placeholder="Hiring Manager"
                    value={coverLetter.recipient}
                    onChange={(e) => updateCoverLetter({ recipient: e.target.value })}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="body">Letter Body</Label>
                <Textarea
                    id="body"
                    placeholder="Dear Hiring Manager..."
                    className="min-h-[300px]"
                    value={coverLetter.body}
                    onChange={(e) => updateCoverLetter({ body: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                    Tip: We'll automatically format the header and signature using your Profile info.
                </p>
            </div>
        </div>
    );
}
