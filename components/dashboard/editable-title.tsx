"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";

/**
 * Click-to-rename title for a dashboard card.
 *
 * The store has always exposed a rename action, but nothing in the UI called
 * it, so users could not name a resume or cover letter at all and every list
 * read as a column of placeholder titles.
 */
export function EditableTitle({
    value,
    onSave,
    placeholder = "Untitled",
}: {
    value: string;
    onSave: (next: string) => void;
    placeholder?: string;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing) inputRef.current?.select();
    }, [editing]);

    // Pick up external changes (e.g. an auto-derived title) while not editing.
    useEffect(() => {
        if (!editing) setDraft(value);
    }, [value, editing]);

    const commit = () => {
        const next = draft.trim();
        if (next && next !== value) onSave(next);
        else setDraft(value);
        setEditing(false);
    };

    const cancel = () => {
        setDraft(value);
        setEditing(false);
    };

    if (editing) {
        return (
            <div className="flex items-center gap-1 mb-1">
                <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") commit();
                        if (e.key === "Escape") cancel();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={placeholder}
                    aria-label="Resume name"
                    className="flex-1 min-w-0 font-bold text-lg bg-transparent border-b border-primary outline-none"
                />
                <button
                    onClick={(e) => { e.stopPropagation(); commit(); }}
                    aria-label="Save name"
                    className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 rounded"
                >
                    <Check className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); cancel(); }}
                    aria-label="Cancel rename"
                    className="p-1 text-muted-foreground hover:bg-muted rounded"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 mb-1 group/title">
            <h3 className="font-bold text-lg truncate">{value || placeholder}</h3>
            <button
                onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                aria-label="Rename"
                // Always rendered rather than hover-revealed: hover controls are
                // unreachable on touch devices.
                className="p-1 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
            >
                <Pencil className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
