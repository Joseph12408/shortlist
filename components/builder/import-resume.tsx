"use client";

import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileText } from "lucide-react";
import { useRef, useState } from "react";
import { parseResume } from "@/lib/parsing/resume-parser";
import { useResumeStore } from "@/lib/store/useResumeStore";

export function ImportResume() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { setResume } = useResumeStore();
    // const { toast } = useToast(); // Assuming we have toast set up, if not we'll allow it to fail silently or simple alert? 
    // We haven't set up the toaster in the layout yet? Shadcn usually has it.
    // I will skip toast for now and just use state/alert to be safe, or just relying on UI feedback.

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const parsedResume = await parseResume(file);
            setResume(parsedResume);
            // alert("Resume imported successfully! Please review and format the data.");
        } catch (error) {
            console.error("Import failed:", error);
            alert("Failed to parse resume. Please try a different file.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset
            }
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileChange}
            />
            <Button variant="outline" size="sm" onClick={handleClick} disabled={isUploading}>
                {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Upload className="mr-2 h-4 w-4" />
                )}
                Import Resume
            </Button>
        </>
    );
}
