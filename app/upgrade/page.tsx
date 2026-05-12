"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, Zap, LayoutTemplate, MessageSquare, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function UpgradePage() {
    const { user } = useUser();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const handleUpgrade = () => {
        setIsCheckoutOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b p-6 sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                        Shortlist<span className="text-primary">.ai</span>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="ghost">Cancel</Button>
                    </Link>
                </div>
            </div>

            <main className="container mx-auto px-6 py-16 max-w-5xl">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                        <Star className="w-4 h-4 fill-primary" />
                        Upgrade to Pro
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Unlock Your Full Career Potential
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Get past ATS filters, write cover letters in seconds, and access premium templates designed by HR experts.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start relative">
                    {/* Free Plan */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 opacity-80">
                        <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
                        <p className="text-muted-foreground mb-6">Basics for your first application</p>
                        <div className="text-4xl font-bold mb-8">$0 <span className="text-lg font-normal text-muted-foreground">/mo</span></div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                <span>Manual Resume Builder</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                <span>Basic "Standard" Template</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                <span>5 PDF Exports / Month</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                <span>Basic AI Score (Overall only)</span>
                            </li>
                        </ul>

                        <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-primary shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            POPULAR
                        </div>

                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            Pro Plan
                            <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </h3>
                        <p className="text-muted-foreground mb-6">Everything you need to get hired</p>
                        <div className="text-4xl font-bold mb-8">$9.99 <span className="text-lg font-normal text-muted-foreground">/mo</span></div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span className="font-medium">Unlimited AI Cover Letter Generation</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span className="font-medium">All Premium Templates</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span className="font-medium">Full AI Analysis & Keyword Matching</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span className="font-medium">Unlimited Exports (No Watermarks)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span className="font-medium">Advanced Editing for Analyzed Resumes</span>
                            </li>
                        </ul>

                        <Button size="lg" className="w-full text-lg h-12 gap-2" onClick={handleUpgrade}>
                            Upgrade Now <ArrowRight className="w-5 h-5" />
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-4">
                            Secure payment via Whop. Cancel anytime.
                        </p>
                    </div>
                </div>

                <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                    <DialogContent className="sm:max-w-2xl bg-black text-white p-0 border-slate-800 h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex-1 w-full h-full min-h-[500px]">
                            <WhopCheckoutEmbed 
                                planId="prod_gCmvpFAxpA8p0" 
                                theme="dark"
                                onComplete={() => {
                                    window.location.href = "/checkout/success";
                                }}
                                prefill={{ email: user?.primaryEmailAddress?.emailAddress }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Feature Deep Dive */}
                <div className="mt-24 grid md:grid-cols-3 gap-8">
                    <div className="text-center p-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <LayoutTemplate className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Premium Templates</h3>
                        <p className="text-muted-foreground">Stand out with creative, sidebar, and executive designs proven to catch attention.</p>
                    </div>
                    <div className="text-center p-6">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">AI Cover Letters</h3>
                        <p className="text-muted-foreground">Stop struggling with writing. Generate perfectly tailored cover letters for every job in seconds.</p>
                    </div>
                    <div className="text-center p-6">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">ATS Guarantee</h3>
                        <p className="text-muted-foreground">Unlimited scans to ensure your resume hits every keyword and passes the bots.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
