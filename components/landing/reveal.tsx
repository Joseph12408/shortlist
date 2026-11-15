"use client";

import { useEffect, useRef, useState } from "react";

/** Adds `ld-in` the first time the element scrolls into view. */
export function Reveal({ className = "", children }: { className?: string; children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const [seen, setSeen] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSeen(true);
                    io.disconnect();
                }
            },
            { threshold: 0.25 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={ref} className={`${className} ${seen ? "ld-in" : ""}`}>
            {children}
        </div>
    );
}
