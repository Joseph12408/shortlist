"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Files, FileType, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The dashboard sub-header, shared by every /dashboard page.
 *
 * Previously each page rendered its own copy, which drifted: labels differed
 * ("Overview" vs "Dashboard"), the AI Reviews tab was missing on two pages, and
 * the inner pages added a "Back to Home" link that made the tabs feel like a
 * one-way trip rather than a persistent switcher. This is the single source.
 */
const TABS = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/resumes", label: "My Resumes", icon: Files },
    { href: "/dashboard/cover-letters", label: "Cover Letters", icon: FileType },
    { href: "/dashboard/reviews", label: "AI Reviews", icon: Brain },
] as const;

export function DashboardNav() {
    const pathname = usePathname();

    return (
        // Horizontally scrollable on narrow screens so four tabs never wrap or
        // clip. The negative margin lets the scroll area bleed to the screen
        // edge while keeping the tabs aligned with the container padding.
        <nav
            className="-mx-4 sm:mx-0 overflow-x-auto scrollbar-none"
            aria-label="Dashboard sections"
        >
            <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-0 min-w-max border-b border-transparent">
                {TABS.map((tab) => {
                    // Exact match for the index route, prefix match for children,
                    // so /dashboard does not stay highlighted on sub-pages.
                    const isActive =
                        tab.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(tab.href);

                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap text-sm transition-colors",
                                isActive
                                    ? "border-blue-600 font-semibold text-blue-600 dark:text-blue-400"
                                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300"
                            )}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            {tab.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

/**
 * Standard dashboard page header: title, optional description and action, then
 * the shared tab bar. Keeps spacing and hierarchy identical across pages.
 */
export function DashboardHeader({
    title,
    description,
    action,
}: {
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
                                {description}
                            </p>
                        )}
                    </div>
                    {action && <div className="w-full md:w-auto shrink-0">{action}</div>}
                </div>

                <DashboardNav />
            </div>
        </div>
    );
}
