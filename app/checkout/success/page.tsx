"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Welcome to Pro! 🎉
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Your payment was successful. You now have full access to all premium features.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-3 text-left">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <span className="font-medium">AI Resume Generation</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-violet-500" />
                        <span className="font-medium">All Premium Templates</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">AI Cover Letter Builder</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium">Unlimited PDF Downloads</span>
                    </div>
                </div>

                <Link href="/dashboard">
                    <Button size="lg" className="w-full gap-2 text-lg h-12">
                        Go to Dashboard <ArrowRight className="w-5 h-5" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
