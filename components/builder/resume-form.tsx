"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, GraduationCap, Briefcase, Code, FolderGit2, Loader2 } from "lucide-react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { ProfileForm } from "./forms/profile-form";
import { EducationForm } from "./forms/education-form";
import { ExperienceForm } from "./forms/experience-form";
import { SkillsForm } from "./forms/skills-form";
import { ProjectsForm } from "./forms/projects-form";
import { LeadershipForm } from "./forms/leadership-form";
import { TemplateSelector } from "./template-selector";
import { Palette } from "lucide-react";
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { CoverLetterForm } from "./cover-letter/cover-letter-form";
// Other imports will follow as we build them
// Imports...
import { JobDescriptionInput } from "../ats/job-description-input";
import { ATSScoreCard } from "../ats/ats-score-card";
import { MissingKeywords } from "../ats/missing-keywords";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ResumeForm() {
    const { viewMode, setViewMode } = useResumeStore();

    // Sync Tabs with viewMode
    // 'resume' and 'design' tabs -> viewMode = 'resume'
    // 'cover-letter' tab -> viewMode = 'cover-letter'
    // We need a local state for the Tab value to allow 'design' to be active while viewMode is 'resume'
    // Or we map tab value change to viewMode update.

    const handleTabChange = (value: string) => {
        if (value === 'cover-letter') {
            setViewMode('cover-letter');
        } else {
            setViewMode('resume');
        }
    };

    // If in Cover Letter Mode, show ONLY Cover Letter Form
    if (viewMode === 'cover-letter') {
        return (
            <div className="flex flex-col min-h-screen">
                <div className="p-6 border-b bg-background">
                    <h2 className="text-2xl font-bold font-heading">Cover Letter</h2>
                    <p className="text-muted-foreground text-sm">Draft your cover letter.</p>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                    {/* Reference Resume Upload (Drag & Drop) */}
                    <div className="mb-6">
                        <ReferenceResumeDropzone />
                    </div>

                    <CoverLetterForm />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="p-6 border-b bg-background">
                <h2 className="text-2xl font-bold font-heading">Editor</h2>
                <p className="text-muted-foreground text-sm">Update your resume details here.</p>
            </div>

            <Tabs
                defaultValue="resume"
                className="flex-1 flex flex-col"
                onValueChange={handleTabChange}
            >
                <div className="px-6 pt-4">
                    <TabsList className="w-full">
                        <TabsTrigger value="resume" className="flex-1">Resume</TabsTrigger>
                        <TabsTrigger value="design" className="flex-1">Design</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="resume" className="flex-1 mt-0">
                    <div className="p-6 pb-20">
                        <div className="mb-8 space-y-6">

                            <JobDescriptionInput />
                            <ATSScoreCard />
                            <MissingKeywords />
                        </div>

                        <Accordion type="single" collapsible defaultValue="profile" className="w-full space-y-4">
                            {/* ... existing accordion items ... */}
                            {/* Profile Accordion */}
                            <AccordionItem value="profile" className="border rounded-lg px-4 bg-card">
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-semibold text-base">Personal Info</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4 pb-6">
                                    <ProfileForm />
                                </AccordionContent>
                            </AccordionItem>

                            {/* Education Accordion */}
                            <AccordionItem value="education" className="border rounded-lg px-4 bg-card">
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            <GraduationCap className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-semibold text-base">Education</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4 pb-6">
                                    <EducationForm />
                                </AccordionContent>
                            </AccordionItem>

                            {/* Experience Accordion */}
                            <AccordionItem value="experience" className="border rounded-lg px-4 bg-card">
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            <Briefcase className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-semibold text-base">Experience</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4 pb-6">
                                    <ExperienceForm />
                                </AccordionContent>
                            </AccordionItem>

                            {/* Leadership Accordion */}
                            <AccordionItem value="leadership" className="border rounded-lg px-4 bg-card">
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            <Briefcase className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-semibold text-base">Leadership Experience</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4 pb-6">
                                    <LeadershipForm />
                                </AccordionContent>
                            </AccordionItem>

                            {/* Projects Accordion */}
                            <AccordionItem value="projects" className="border rounded-lg px-4 bg-card">
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            <FolderGit2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-semibold text-base">Projects</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4 pb-6">
                                    <ProjectsForm />
                                </AccordionContent>
                            </AccordionItem>

                            {/* Skills Accordion */}
                            <AccordionItem value="skills" className="border rounded-lg px-4 bg-card">
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            <Code className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-semibold text-base">Skills</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4 pb-6">
                                    <SkillsForm />
                                </AccordionContent>
                            </AccordionItem>

                        </Accordion>
                    </div>
                </TabsContent>

                <TabsContent value="design" className="flex-1 mt-0">
                    <div className="p-6 pb-20">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                Design & Formatting
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Choose a template and customize the colors to match your style.
                            </p>
                            <TemplateSelector />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function ReferenceResumeDropzone() {
    const { referenceResume, setReferenceResume } = useResumeStore();
    const [isParsing, setIsParsing] = React.useState(false);

    const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsParsing(true);
        try {
            // Dynamic PDF Import
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
                fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
            }

            // API Parse
            const res = await fetch('/api/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: fullText })
            });
            const data = await res.json();

            if (data.success && data.resume) {
                setReferenceResume(data.resume);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to parse reference resume.");
        } finally {
            setIsParsing(false);
        }
    }, [setReferenceResume]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    return (
        <div
            {...getRootProps()}
            className={`
                relative min-h-[200px] flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
                ${isDragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                ${isParsing ? 'opacity-50 pointer-events-none' : ''}
            `}
        >
            <input {...getInputProps()} />

            {/* Icon Circle */}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${referenceResume ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                }`}>
                {isParsing ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                ) : referenceResume ? (
                    <Briefcase className="w-7 h-7" />
                ) : (
                    <FolderGit2 className="w-7 h-7" />
                    // Note: Using FolderGit2 as generic upload icon or import Upload from lucide if available. 
                    // I will assume standard Lucide icons are available or use what's already imported.
                )}
            </div>

            <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">
                    {referenceResume ? 'Reference Resume Loaded' : 'Upload Resume for Cover Letter'}
                </h3>

                {referenceResume ? (
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {referenceResume.profile.fullName || "Candidate"}
                        </p>
                        <p className="text-xs text-green-600 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                            Ready for AI Generation
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Drag & drop a different file to replace
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Drag & drop your specific PDF here, or click to select. <br />
                        <span className="text-xs opacity-75">We use this to tailor your letter.</span>
                    </p>
                )}
            </div>
        </div>
    );
}
