'use client';

import { ReactNode, useEffect, useRef } from "react";
import { useConvexAuth } from "convex/react";
import { useResumeStore } from "@/lib/store/useResumeStore";

/**
 * Keeps the resume store in step with the signed-in account, app-wide.
 *
 * Before this existed, the only thing that ever loaded from Convex was the
 * builder page's persistence hook. Every other screen (dashboard, My Resumes,
 * Cover Letters) rendered straight from the localStorage mirror, so signing in
 * on a second device showed a brand-new-looking account: the rows were on the
 * server, nothing ever asked for them.
 *
 * Two rules:
 *  - Sign in, and once Clerk has actually issued a token, hydrate from Convex.
 *    Waiting for the token matters. Firing the query early returns an empty
 *    list (the Convex query treats "no identity" as "no rows") and the app
 *    would conclude the account was empty.
 *  - Sign out, and drop the local mirror, so the next person on a shared
 *    machine does not see the previous user's work.
 */
export function StoreSyncProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const initialize = useResumeStore((s) => s.initialize);
    const clearLocalData = useResumeStore((s) => s.clearLocalData);
    const lastState = useRef<'in' | 'out' | null>(null);

    useEffect(() => {
        if (isLoading) return;

        if (isAuthenticated) {
            if (lastState.current === 'in') return;
            lastState.current = 'in';
            initialize();
        } else {
            if (lastState.current === 'out') return;
            lastState.current = 'out';
            clearLocalData();
        }
    }, [isAuthenticated, isLoading, initialize, clearLocalData]);

    return <>{children}</>;
}
