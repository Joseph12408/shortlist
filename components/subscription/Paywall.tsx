'use client';

import { useState } from 'react';
import { useSubscriptionStore } from '@/lib/store/useSubscriptionStore';
import { Package } from '@revenuecat/purchases-js';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function Paywall({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { offerings, purchasePackage, isLoading, isPro } = useSubscriptionStore();
    const [isPurchasing, setIsPurchasing] = useState(false);

    const handlePurchase = async (pkg: Package) => {
        setIsPurchasing(true);
        try {
            await purchasePackage(pkg);
            onOpenChange(false);
        } catch (error) {
            console.error("Purchase cancelled or failed", error);
        } finally {
            setIsPurchasing(false);
        }
    };

    if (!offerings || !offerings.current) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white border-slate-800">
                <DialogHeader className="text-center">
                    <DialogTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Upgrade to Shortlist Pro
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 text-lg">
                        Unlock the full potential of your career tools.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
                    {offerings.current.availablePackages.map((pkg) => (
                        <div
                            key={pkg.identifier}
                            className="relative rounded-2xl border border-slate-700 bg-slate-800/50 p-6 flex flex-col hover:border-blue-500 transition-colors"
                        >
                            <h3 className="text-xl font-semibold mb-2">{pkg.product.title}</h3>
                            <div className="text-3xl font-bold mb-4">
                                {pkg.product.priceString}
                            </div>

                            <ul className="space-y-3 mb-6 flex-grow text-gray-300">
                                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> AI Resume Generation</li>
                                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Unlimited PDF Downloads</li>
                                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Cover Letter Builder</li>
                                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Cloud Sync & Storage</li>
                            </ul>

                            <Button
                                onClick={() => handlePurchase(pkg)}
                                disabled={isPurchasing}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isPurchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="text-center text-xs text-gray-500 mt-4">
                    <button onClick={() => useSubscriptionStore.getState().restorePurchases()} className="underline hover:text-gray-300">
                        Restore Purchases
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
