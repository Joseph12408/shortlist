"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/lib/store/useResumeStore";

export function JobDescriptionInput() {
    const { jobDescription, setJobDescription } = useResumeStore();

    return (
        <div className="grid gap-2">
            <div className="flex justify-between items-center">
                <Label htmlFor="jobDescription" className="font-semibold text-primary">Job Description</Label>
                <span className="text-xs text-muted-foreground">{jobDescription.length} chars</span>
            </div>
            <Textarea
                id="jobDescription"
                placeholder="Paste the job requirements here to get ATS analysis..."
                className="min-h-[150px] font-mono text-sm"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
                We'll analyze your resume against this text to find missing keywords.
            </p>
        </div>
    );
}
