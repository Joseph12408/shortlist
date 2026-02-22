"use client";

import { Progress } from "@/components/ui/progress";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function ATSScoreCard() {
    const { atsScore, atsFeedback, jobDescription } = useResumeStore();

    if (!jobDescription.trim()) {
        return (
            <div className="p-4 border rounded-lg bg-muted/20 text-center">
                <p className="text-sm text-muted-foreground">Paste a Job Description to get your ATS Score.</p>
            </div>
        )
    }

    let colorClass = "bg-red-500";
    let textColor = "text-red-500";
    let statusIcon = <AlertCircle className="h-5 w-5 text-red-500" />;
    let message = "Needs Improvement";

    if (atsScore >= 70) {
        colorClass = "bg-green-500";
        textColor = "text-green-500";
        statusIcon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
        message = "Great Match!";
    } else if (atsScore >= 40) {
        colorClass = "bg-yellow-500";
        textColor = "text-yellow-500";
        statusIcon = <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        message = "Getting There";
    }

    return (
        <div className="p-4 border rounded-lg bg-card shadow-sm space-y-4">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">ATS Score</h3>
                    <div className="flex items-center gap-2">
                        {statusIcon}
                        <span className={`font-bold ${textColor}`}>{message}</span>
                    </div>
                </div>

                <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold">{atsScore}</span>
                    <span className="text-muted-foreground mb-1">/ 100</span>
                </div>

                <Progress value={atsScore} className="h-3" indicatorClassName={colorClass} />
                <p className="mt-2 text-xs text-muted-foreground">Based on keyword matching and completeness.</p>
            </div>

            {atsFeedback && atsFeedback.length > 0 && (
                <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">Optimization Tips</h4>
                    <div className="space-y-3">
                        {atsFeedback.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-start text-sm">
                                <div className="mt-0.5 shrink-0">
                                    {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                    {item.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                </div>
                                <div>
                                    <span className="font-medium mr-1">{item.category}:</span>
                                    <span className="text-muted-foreground">{item.message}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
