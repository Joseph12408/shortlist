"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useResumeStore } from "@/lib/store/useResumeStore";

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
    const { setSubscriptionStatus } = useResumeStore();

    const handleUpgrade = () => {
        // In a real app, this would redirect to Stripe
        // For MVP demo, we just switch the state
        setSubscriptionStatus('pro');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Upgrade to Pro</DialogTitle>
                    <DialogDescription className="text-center">
                        Unlock premium templates and export options.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                            <div className="p-1 rounded-full bg-green-100 text-green-600">
                                <Check className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium">Download editable DOCX</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="p-1 rounded-full bg-green-100 text-green-600">
                                <Check className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium">Access Modern & Minimal Templates</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="p-1 rounded-full bg-green-100 text-green-600">
                                <Check className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium">Unlimited Job Scans</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="p-1 rounded-full bg-green-100 text-green-600">
                                <Check className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium">Cover Letter Generation</span>
                        </li>
                    </ul>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleUpgrade}>
                        Upgrade for $9/mo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
