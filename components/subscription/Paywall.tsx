'use client';

import { useState } from 'react';
import { useSubscriptionStore } from '@/lib/store/useSubscriptionStore';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const MONTHLY_PRODUCT_ID = "7bd5c63f-c3c6-40f2-931a-93613caf62d4";
const YEARLY_PRODUCT_ID = "4b92f1ab-19d2-476b-b993-0ca44379e4cc";

export function Paywall({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { isPro } = useSubscriptionStore();
    const { user } = useUser();
    const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

    const handlePurchase = (productId: string) => {
        setIsPurchasing(productId);
        const email = user?.primaryEmailAddress?.emailAddress || "";
        const checkoutUrl = `/api/checkout?products=${productId}${email ? `&customerEmail=${encodeURIComponent(email)}` : ""}`;
        window.location.href = checkoutUrl;
    };

    if (isPro) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white border-slate-800">
                <DialogHeader className="text-center">
                    <DialogTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Upgrade to Shortlist Pro
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 text-lg">
                        Unlock the full potential of your career tools. Choose your plan.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 max-w-2xl mx-auto w-full">
                    {/* Monthly Plan */}
                    <div className="relative rounded-2xl border border-slate-700 bg-slate-800/50 p-6 flex flex-col hover:border-blue-500 transition-colors">
                        <h3 className="text-xl font-semibold mb-2 text-center">Pro Monthly</h3>
                        <div className="text-3xl font-bold mb-4 text-center">
                            $15 <span className="text-sm font-normal text-gray-400">/ mo</span>
                        </div>

                        <ul className="space-y-3 mb-6 flex-grow text-gray-300">
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> AI Resume Generation</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Unlimited PDF Downloads</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Cover Letter Builder</li>
                        </ul>

                        <Button
                            onClick={() => handlePurchase(MONTHLY_PRODUCT_ID)}
                            disabled={isPurchasing !== null}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                        >
                            {isPurchasing === MONTHLY_PRODUCT_ID ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe Monthly"}
                        </Button>
                    </div>

                    {/* Yearly Plan */}
                    <div className="relative rounded-2xl border border-blue-500 bg-blue-900/20 p-6 flex flex-col hover:border-blue-400 transition-colors">
                        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-gradient-to-r from-blue-500 to-emerald-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            BEST VALUE
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-center text-blue-100">Pro Yearly</h3>
                        <div className="text-3xl font-bold mb-4 text-center text-white">
                            $120 <span className="text-sm font-normal text-blue-200">/ yr</span>
                        </div>

                        <ul className="space-y-3 mb-6 flex-grow text-gray-300">
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> AI Resume Generation</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Unlimited PDF Downloads</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Cover Letter Builder</li>
                        </ul>

                        <Button
                            onClick={() => handlePurchase(YEARLY_PRODUCT_ID)}
                            disabled={isPurchasing !== null}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                        >
                            {isPurchasing === YEARLY_PRODUCT_ID ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe Yearly"}
                        </Button>
                    </div>
                </div>

                <div className="text-center text-xs text-gray-500 mt-4">
                    Secure checkout powered by Polar
                </div>
            </DialogContent>
        </Dialog>
    );
}
