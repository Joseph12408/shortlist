"use client";

import { Check, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { WhopCheckoutEmbed } from '@whop/checkout/react';
import { useUser } from '@clerk/nextjs';
import {
    FREE_MONTHLY_EXPORTS,
    FREE_MONTHLY_JOB_SCANS,
    FREE_TEMPLATES,
    FREE_VISIBLE_ISSUES,
    PRO_TEMPLATES,
    WHOP_PLAN_MONTHLY,
    WHOP_PLAN_YEARLY,
} from '@/lib/tiers';
import "./landing.css";

const FREE_ITEMS = [
    `Resume score with your top ${FREE_VISIBLE_ISSUES} fixes`,
    `Resume builder with ${FREE_TEMPLATES.length} templates`,
    `${FREE_MONTHLY_JOB_SCANS} job description scans a month`,
    `${FREE_MONTHLY_EXPORTS} watermarked PDF exports a month`,
];

const PRO_ITEMS = [
    "Every issue, with how to fix it",
    "AI rewrites and cover letters",
    `All ${FREE_TEMPLATES.length + PRO_TEMPLATES.length} templates`,
    "Unlimited job description scans",
    "Clean PDF and DOCX exports",
];

function PlanList({ items }: { items: string[] }) {
    return (
        <ul>
            {items.map((item) => (
                <li key={item}>
                    <Check aria-hidden="true" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

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
        <section id="pricing" className="ld ld-section">
            <div className="ld-wrap">
                <div className="ld-center">
                    <p className="ld-eyebrow">Pricing</p>
                    <h2 className="ld-h2">Free to check. Pro when you are applying.</h2>
                    <p className="ld-lede">
                        See your score without paying anything. Upgrade when you want every fix,
                        every template and clean exports.
                    </p>
                </div>

                <div className="ld-plans">
                    <div className="ld-card ld-plan">
                        <h3>Free</h3>
                        <p className="ld-plan-sub">Find out where your resume stands</p>
                        <div className="ld-price">
                            <b>$0</b>
                        </div>
                        <PlanList items={FREE_ITEMS} />
                        <Link href="/analysis" className="ld-btn ld-btn-ghost ld-btn-block">
                            Score my resume
                        </Link>
                    </div>

                    <div className="ld-card ld-plan">
                        <h3>Pro Monthly</h3>
                        <p className="ld-plan-sub">For an active job search</p>
                        <div className="ld-price">
                            <b>$15</b>
                            <span>per month</span>
                        </div>
                        <PlanList items={PRO_ITEMS} />
                        <button
                            type="button"
                            className="ld-btn ld-btn-ghost ld-btn-block"
                            onClick={() => setCheckoutPlan(WHOP_PLAN_MONTHLY)}
                        >
                            Get Pro Monthly
                        </button>
                    </div>

                    <div className="ld-card ld-plan ld-plan-best">
                        <div className="ld-plan-flag">Save 33%</div>
                        <h3>Pro Yearly</h3>
                        <p className="ld-plan-sub">Works out to $10 a month</p>
                        <div className="ld-price">
                            <b>$120</b>
                            <span>per year</span>
                        </div>
                        <PlanList items={PRO_ITEMS} />
                        <button
                            type="button"
                            className="ld-btn ld-btn-marker ld-btn-block"
                            onClick={() => setCheckoutPlan(WHOP_PLAN_YEARLY)}
                        >
                            Get Pro Yearly
                        </button>
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
