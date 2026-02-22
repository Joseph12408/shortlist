"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, FileText, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useResumeStore } from "@/lib/store/useResumeStore";

interface AILandingProps {
    onComplete: () => void;
}

export function AILanding({ onComplete }: AILandingProps) {
    const [isParsing, setIsParsing] = useState(false);
    const [scratchMode, setScratchMode] = useState(false);
    const { setResume, updateProfile } = useResumeStore();

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
            console.error("PDF Parse Error:", error);
            if (error.name === 'MissingPDFException') throw new Error("Invalid PDF file.");
            if (error.message?.includes('worker')) throw new Error("PDF Worker failed to load.");
            throw new Error(error.message || "Failed to parse PDF");
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
                setResume({
                    ...data.resume,
                    id: data.resume.id || "draft" // Ensure ID exists
                });
                onComplete();
            } else {
                alert("Failed to parse resume: " + (data.error || "Unknown error"));
            }

        } catch (error: any) {
            console.error(error);
            alert(`Failed to process file: ${error.message}`);
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
        if (!fullName || !jobTitle) return;

        setIsParsing(true);
        // Simulate "AI Generating"
        await new Promise(resolve => setTimeout(resolve, 2000));

        updateProfile({
            fullName,
            summary: `Aspiring ${jobTitle} with a passion for excellence and a track record of...`, // Mock AI Start
            location: "City, Country",
        });

        setIsParsing(false);
        onComplete();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span>AI-Powered Resume Builder</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-foreground">
                    Let's build your <span className="text-primary">winning resume</span>.
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Upload your existing resume for an instant AI audit, or let our agent draft a new one for you from scratch.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 w-full">
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
                            onClick={onComplete}
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
