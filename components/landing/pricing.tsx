"use client";

import { Button } from "@/components/ui/button";
import { Check, LayoutTemplate, MessageSquare, ShieldCheck, Loader2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState, useEffect } from "react";
import { WhopCheckoutEmbed } from '@whop/checkout/react';
import { useUser } from '@clerk/nextjs';
import { WHOP_PLAN_MONTHLY, WHOP_PLAN_YEARLY } from '@/lib/tiers';

export function Pricing() {
    const { user } = useUser();
    const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);

    // Prevent scrolling when checkout is open
    useEffect(() => {
        if (checkoutPlan) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [checkoutPlan]);
    return (
        <section id="pricing" className="py-24 px-6">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                        Simple, honest pricing
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Start for free, upgrade when you're ready to get serious.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    <Card className="flex flex-col border-border/50">
                        <CardHeader>
                            <CardTitle className="text-2xl">Free</CardTitle>
                            <CardDescription>Perfect for checking your current resume</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>Basic ATS Score Analysis</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>Manual resume building</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>Limited Job Description Scans</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="outline" asChild>
                                <Link href="/builder">Get Started</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pro Monthly */}
                    <Card className="flex flex-col border-border/50 relative overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-2xl">Pro Monthly</CardTitle>
                            <CardDescription>Everything you need, month-to-month</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">$15</span>
                                <span className="text-muted-foreground">/mo</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>Full ATS Optimization & Suggestions</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>Unlimited Job Description Scans</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>Unlimited PDF & DOCX Exports</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="outline" onClick={() => setCheckoutPlan(WHOP_PLAN_MONTHLY)}>
                                Get Monthly
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pro Yearly */}
                    <Card className="flex flex-col border-primary shadow-lg bg-primary/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                            BEST VALUE
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl text-primary">Pro Yearly</CardTitle>
                            <CardDescription>Save big with a yearly commitment</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">$120</span>
                                <span className="text-muted-foreground">/yr</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>Full ATS Optimization & Suggestions</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>Unlimited Job Description Scans</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>Unlimited PDF & DOCX Exports</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span className="font-semibold">Save 33% yearly</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => setCheckoutPlan(WHOP_PLAN_YEARLY)}>
                                Get Yearly
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                {/* Feature Deep Dive */}
                <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
            </div>

            {/* Full-Screen Checkout Overlay — centered layout */}
            {checkoutPlan && (
                <div className="fixed inset-0 z-[99999] w-screen h-screen overflow-y-auto" style={{ backgroundColor: '#F4F4F5' }}>
                    {/* Top bar with back button */}
                    <div className="sticky top-0 z-10 flex items-center h-14 px-4 md:px-8" style={{ backgroundColor: '#F4F4F5', borderBottom: '1px solid #E4E4E7' }}>
                        <button 
                            onClick={() => setCheckoutPlan(null)} 
                            className="flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 transition-colors"
                            style={{ color: '#71717A', backgroundColor: 'transparent' }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#E4E4E7'; e.currentTarget.style.color = '#18181B'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#71717A'; }}
                        >
                            <X className="w-4 h-4" />
                            Back to Plans
                        </button>
                    </div>

                    {/* Centered Checkout Form */}
                    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
                        <WhopCheckoutEmbed 
                            planId={checkoutPlan} 
                            theme="light"
                            fallback={
                                <div className="flex flex-col items-center justify-center py-32 rounded-xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4E4E7' }}>
                                    <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: '#A1A1AA' }} />
                                    <p className="font-medium animate-pulse" style={{ color: '#71717A' }}>Loading secure checkout...</p>
                                </div>
                            }
                            onComplete={(planId, receiptId) => {
                                console.log("Checkout complete", planId, receiptId);
                                window.location.href = "/checkout/success";
                            }}
                            prefill={{ email: user?.primaryEmailAddress?.emailAddress }}
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
