import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <div className="container px-6 mx-auto relative z-10 text-center">
                <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 tracking-tight">
                    Ready to land your dream job?
                </h2>
                <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
                    Join thousands of job seekers who have optimized their resumes and found success.
                </p>

                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold shadow-xl hover:scale-105 transition-transform" asChild>
                    <Link href="/dashboard">
                        Get Started for Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>

                <p className="mt-6 text-sm text-primary-foreground/60">
                    No credit card required · Instant access
                </p>
            </div>
        </section>
    );
}
