"use client";

import { useEffect, useRef } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";

export function useResumePersistence() {
    const { resume, initialLoadDone, saveCurrentResume } = useResumeStore();
    const isFirstRender = useRef(true);
    const timeoutRef = useRef<NodeJS.Timeout>(null);

    // Hydration is no longer done here. StoreSyncProvider loads from Convex
    // once for the whole app as soon as Clerk issues a token, so the builder is
    // not the only screen that ever sees the account's real data.

    // Auto-save
    useEffect(() => {
        if (!initialLoadDone) return;
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            // Auto-save to "savedResumes" list for local persistence
            saveCurrentResume();
        }, 2000); // 2 second debounce

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [resume, initialLoadDone, saveCurrentResume]);
}
