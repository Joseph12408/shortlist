"use client";

import { FileText, Target, Zap, LayoutTemplate } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const features = [
    {
        icon: Zap,
        title: "Instant Download",
        descriptions: [
            "No waiting. Create your resume and download it immediately in PDF or DOCX format.",
            "Get your polished resume in seconds, ready for any job application.",
            "Export to standard formats instantly without any hidden delays."
        ],
        iconAnimation: {
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
            filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
    },
    {
        icon: Target,
        title: "Market Tested Templates",
        descriptions: [
            "Designs proven to get past ATS filters and catch recruiters' eyes in seconds.",
            "Layouts optimized for readability and recruiter scanning patterns.",
            "Stand out with templates designed by HR professionals."
        ],
        iconAnimation: {
            rotate: 360,
            transition: { duration: 8, repeat: Infinity, ease: "linear" }
        }
    },
    {
        icon: LayoutTemplate,
        title: "Real-time AI Feedback",
        descriptions: [
            "Our AI scores your resume as you build, offering tips to improve your hiring chances.",
            "Get instant suggestions to improve your grammar, impact, and keywords.",
            "Optimize your resume content with smart, real-time analysis."
        ],
        iconAnimation: {
            y: [0, -8, 0],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
    },
    {
        icon: FileText,
        title: "Tailored Content",
        descriptions: [
            "Automatically optimize your experience bullet points to match the job description.",
            "Customize your resume for every job application with a single click.",
            "Generate role-specific content that highlights your relevant skills."
        ],
        iconAnimation: {
            rotate: [0, -10, 10, -10, 10, 0],
            transition: { duration: 2, repeat: Infinity, repeatDelay: 3 }
        }
    },
];

export function Features() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="features" className="py-24 bg-secondary/30 overflow-hidden">
            <div className="container px-6 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                        Everything you need to get hired
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Stop guessing what recruiters want. Give them exactly what they're looking for with our intelligent tools.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, featureIdx) => (
                        <Card key={featureIdx} className="border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50 transition-colors overflow-hidden">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 relative">
                                    <motion.div
                                        animate={feature.iconAnimation}
                                    >
                                        <feature.icon className="h-6 w-6 text-primary" />
                                    </motion.div>
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-20 relative"> {/* Fixed height to prevent layout shift */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute top-0 left-0 w-full"
                                        >
                                            <CardDescription className="text-base leading-relaxed">
                                                {feature.descriptions[index]}
                                            </CardDescription>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
