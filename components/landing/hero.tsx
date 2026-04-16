import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CircuitBackground } from "@/components/ui/circuit-background";

export function Hero() {
    return (
        <section className="relative px-6 py-24 md:py-32 overflow-hidden bg-background">
            <CircuitBackground />
            <div className="container relative z-10 mx-auto max-w-5xl text-center">
                <div className="m-0 p-0 relative bg-background/60 backdrop-blur-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground font-heading mb-6 px-4 pt-12">
                        Build resumes that actually{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">
                            get shortlisted
                        </span>
                        .
                    </h1>

                    <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed px-4">
                        Stop getting rejected by ATS bots. create modern, optimized resumes tailored to specific job descriptions in minutes.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 px-4">
                        <Button size="lg" className="h-12 px-8 text-base w-full sm:w-auto" asChild>
                            <Link href="/dashboard">
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-muted-foreground mb-12 px-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>ATS-Friendly Templates</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Job Description Matching</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Real-time Scoring</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        </section>
    );
}
