"use client";

import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/lib/store/useResumeStore";

export function MissingKeywords() {
    const { missingKeywords, jobDescription } = useResumeStore();

    if (!jobDescription.trim() || missingKeywords.length === 0) {
        return null;
    }

    return (
        <div className="p-4 border rounded-lg bg-card shadow-sm">
            <h3 className="font-semibold mb-3">Missing Keywords</h3>
            <p className="text-xs text-muted-foreground mb-4">
                Consider adding these to your profile or skills to improve your match score.
            </p>

            <div className="flex flex-wrap gap-2">
                {missingKeywords.map((keyword, i) => (
                    <Badge key={i} variant="outline" className="border-destructive/50 text-destructive bg-destructive/5">
                        {keyword}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
