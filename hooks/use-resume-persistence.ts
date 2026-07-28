"use client";

import { useEffect, useRef } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";

export function useResumePersistence() {
    const { resume, initialLoadDone, initialize, saveCurrentResume } = useResumeStore();
    const isFirstRender = useRef(true);
    const timeoutRef = useRef<NodeJS.Timeout>(null);

    // Initial load
    useEffect(() => {
        initialize();
    }, [initialize]);

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
