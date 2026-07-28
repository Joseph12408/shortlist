"use client";

import { useToastStore } from "@/lib/toast";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
    const { toasts, dismiss } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[999999] flex w-full max-w-sm flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    role="alert"
                    className={cn(
                        "pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-300",
                        t.type === "error" &&
                            "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/90 dark:border-red-900 dark:text-red-200",
                        t.type === "success" &&
                            "bg-green-50 border-green-200 text-green-900 dark:bg-green-950/90 dark:border-green-900 dark:text-green-200",
                        t.type === "info" &&
                            "bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                    )}
                >
                    <div className="mt-0.5 shrink-0">
                        {t.type === "error" && <AlertCircle className="w-5 h-5" />}
                        {t.type === "success" && <CheckCircle2 className="w-5 h-5" />}
                        {t.type === "info" && <Info className="w-5 h-5" />}
                    </div>
                    <p className="flex-1 text-sm leading-relaxed">{t.message}</p>
                    <button
                        onClick={() => dismiss(t.id)}
                        className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
