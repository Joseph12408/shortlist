"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, FileText, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { toast } from "@/lib/toast";

interface AILandingProps {
    onComplete: () => void;
}

export function AILanding({ onComplete }: AILandingProps) {
    const [isParsing, setIsParsing] = useState(false);
    const [scratchMode, setScratchMode] = useState(false);
    const { setResume, updateProfile, resetBuilderSession } = useResumeStore();
    const { isPro } = useFeatureAccess();

    // --- File Upload Logic ---
    // --- File Upload Logic ---
    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            const pdfjsLib = await import('pdfjs-dist');
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            }

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(" ");
                fullText += pageText + "\n";
            }
            return fullText;
        } catch (error: any) {
            // Full detail stays in the console.
            console.error("PDF Parse Error:", error);
            if (error.name === 'MissingPDFException') throw new Error("That file doesn't look like a valid PDF.");
            if (error.message?.includes('worker')) throw new Error("Couldn't load the PDF reader. Please check your internet connection.");
            throw new Error("Couldn't read that PDF. Please try a different file.");
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsParsing(true);
        try {
            let text = "";
            if (file.type === "application/pdf") {
                text = await extractTextFromPDF(file);
            } else {
                text = await file.text();
            }

            // Call the AI Parsing API
            const res = await fetch('/api/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();

            if (data.success && data.resume) {
                resetBuilderSession();
                setResume({
                    ...data.resume,
                    id: data.resume.id || "draft"
                });
                onComplete();
            } else {
                // data.error is already a user-safe message from the API route.
                toast.error(data.error || "Something went wrong reading your resume. Please try again.");
            }

        } catch (error: any) {
            // Full detail stays in the console. `error.message` here comes only
            // from the safe messages thrown above, never raw library internals.
            console.error(error);
            toast.error(error.message || "Something went wrong processing your file. Please try again.");
        } finally {
            setIsParsing(false);
        }
    }, [setResume, onComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        multiple: false
    });

    // --- Scratch Logic ---
    const [fullName, setFullName] = useState("");
    const [jobTitle, setJobTitle] = useState("");

    const handleScratchStart = async () => {
        resetBuilderSession();
        onComplete();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-foreground mt-4">
                    Let's build your <span className="text-primary">winning resume</span>.
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Upload your existing resume for an instant AI audit, or let our agent draft a new one for you from scratch.
                </p>
            </motion.div>

            <div className={`grid gap-8 w-full md:grid-cols-2`}>
                {/* Option 1: Upload */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="h-full"
                    >
                    <Card
                        {...getRootProps()}
                        className={`
                            relative h-full min-h-[300px] flex flex-col items-center justify-center p-8 border-2 border-dashed cursor-pointer transition-all duration-300
                            ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
                        `}
                    >
                        <input {...getInputProps()} />
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            {isParsing ? (
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            ) : (
                                <Upload className="w-8 h-8 text-primary" />
                            )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Upload Resume</h3>
                        <p className="text-sm text-muted-foreground text-center mb-6">
                            Drag & drop your PDF or DOCX here<br />to get an instant AI score & fix.
                        </p>
                        <Button variant="secondary" disabled={isParsing}>
                            {isParsing ? "Analyzing..." : "Select File"}
                        </Button>
                    </Card>
                </motion.div>


                {/* Option 2: Start Fresh */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="h-full"
                >
                    <Card className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 border-2 border-transparent shadow-lg bg-card/50 backdrop-blur-sm">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                            <Sparkles className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Start from Scratch</h3>
                        <p className="text-sm text-muted-foreground text-center mb-8 max-w-xs">
                            No resume yet? No problem. Build one step-by-step with our guided form.
                        </p>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8"
                            onClick={handleScratchStart}
                        >
                            Create New Resume
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
