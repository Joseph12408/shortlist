"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

/**
 * Delete control for a builder entry card.
 *
 * These used to be icon-only buttons positioned in the card corner with
 * `opacity-0 group-hover:opacity-100`. Touch devices have no hover, so the
 * control never became visible and mobile users could not remove an entry at
 * all. It is now always visible, labelled, and meets the 44px minimum tap
 * target.
 */
export function RemoveEntryButton({
    label,
    onRemove,
}: {
    /** What is being removed, e.g. "experience". Used for the accessible name. */
    label: string;
    onRemove: () => void;
}) {
    return (
        <div className="flex justify-end pt-3 border-t border-border/60">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                aria-label={`Remove this ${label}`}
                className="min-h-11 gap-2 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
                <Trash2 className="h-4 w-4" />
                Remove
            </Button>
        </div>
    );
}
