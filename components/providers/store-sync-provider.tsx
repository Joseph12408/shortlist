'use client';

import { ReactNode, useEffect, useRef } from "react";
import { useConvexAuth } from "convex/react";
import { useAuth } from "@clerk/nextjs";
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
 * Clearing happens on sign-IN when the account changes, never on sign-out.
 *
 * The first version cleared on sign-out, which was wrong in a way that
 * destroyed work. `isAuthenticated` is false for every signed-out page view,
 * including a visitor simply opening the landing page, so the mirror was wiped
 * before its contents could ever be uploaded. Anything created while the
 * backend was unreachable still carries a draft id and lives nowhere else, and
 * that is exactly what it deleted.
 *
 * Checking at sign-in instead keeps the shared-machine protection (a different
 * user never inherits the previous one's list, because it is cleared before
 * hydration) while giving unsynced drafts a chance to reach the server on the
 * next sign-in.
 */
export function StoreSyncProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { userId } = useAuth();
    const initialize = useResumeStore((s) => s.initialize);
    const clearLocalData = useResumeStore((s) => s.clearLocalData);
    const syncedFor = useRef<string | null>(null);

    useEffect(() => {
        // Wait for a token. Firing early returns an empty list, because the
        // Convex queries treat "no identity" as "no rows", and the app would
        // conclude the account was empty.
        if (isLoading || !isAuthenticated || !userId) return;
        if (syncedFor.current === userId) return;
        syncedFor.current = userId;

        const previousUserId = useResumeStore.getState().lastUserId;
        if (previousUserId && previousUserId !== userId) {
            // Somebody else was signed in on this machine. Their work is on
            // their own account already, or it is a draft that is not ours to
            // upload. Either way it must not follow them into this session.
            clearLocalData();
        }

        useResumeStore.setState({ lastUserId: userId });
        initialize();
    }, [isAuthenticated, isLoading, userId, initialize, clearLocalData]);

    return <>{children}</>;
}
