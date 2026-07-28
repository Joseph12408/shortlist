import { cn } from "@/lib/utils";

/**
 * Base shimmer block. Compose these into page-shaped skeletons rather than
 * showing a bare spinner, so the layout does not jump when real content lands.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            aria-hidden="true"
            className={cn("animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-800/70", className)}
            {...props}
        />
    );
}
