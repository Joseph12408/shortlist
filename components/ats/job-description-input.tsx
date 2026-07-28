"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function JobDescriptionInput() {
    const { jobDescription, setJobDescription, commitJobScan, refreshScanUsage, scanUsage } =
        useResumeStore();
    const { isPro } = useFeatureAccess();
    const router = useRouter();

    const text = jobDescription ?? "";

    // Show the user where they stand before they hit the wall.
    useEffect(() => {
        refreshScanUsage();
    }, [refreshScanUsage]);

    const remaining =
        scanUsage.limit === null ? null : Math.max(0, scanUsage.limit - scanUsage.used);

    return (
        <div className="grid gap-2">
            <div className="flex justify-between items-center gap-3 flex-wrap">
                <Label htmlFor="jobDescription" className="font-semibold text-primary">
                    Job Description
                </Label>
                <span className="text-xs text-muted-foreground">{text.length} chars</span>
            </div>

            <Textarea
                id="jobDescription"
                placeholder="Paste the job requirements here to get ATS analysis..."
                className="min-h-[150px] font-mono text-sm"
                value={text}
                onChange={(e) => setJobDescription(e.target.value)}
                // Commit on blur rather than per keystroke: a "scan" is one job
                // posting, not one character. The server also de-duplicates by
                // JD hash so re-analysing the same posting never re-charges.
                onBlur={() => commitJobScan()}
            />

            {scanUsage.blocked ? (
                <div className="rounded-lg border border-dashed border-amber-300 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-4 text-center">
                    <Lock className="w-4 h-4 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs text-muted-foreground mb-3">
                        You have used all {scanUsage.limit} job scans included this month.
                        Upgrade to Pro for unlimited scans.
                    </p>
                    <Button size="sm" onClick={() => router.push("/pricing")}>
                        Upgrade to Pro
                    </Button>
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">
                    {isPro || remaining === null
                        ? "We'll analyze your resume against this text to find missing keywords."
                        : `${remaining} of ${scanUsage.limit} job scans left this month.`}
                </p>
            )}
        </div>
    );
}
