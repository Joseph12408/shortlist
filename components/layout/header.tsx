"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sparkles, UserCircle, Crown, LayoutDashboard, FileText, BarChart3, Settings } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useState } from "react";
import { useSubscriptionStore } from "@/lib/store/useSubscriptionStore";

function UpgradeButton() {
    const { isPro } = useSubscriptionStore();

    if (isPro) return null;

    return (
        <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden md:flex gap-2 border-amber-500/50 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
        >
            <Link href="/pricing">
                <Crown className="w-4 h-4" />
                Upgrade
            </Link>
        </Button>
    );
}

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <img src="/logo.svg" alt="Shortlist Logo" className="h-6 w-6 text-primary" />
                    <span className="font-heading text-xl font-bold tracking-tight text-foreground">
                        Shortlist
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {/* Links shown ONLY when signed OUT */}
                    <SignedOut>
                        <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                            Features
                        </Link>
                        <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                            How it Works
                        </Link>
                        <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                            Pricing
                        </Link>
                    </SignedOut>

                    {/* Links shown ONLY when signed IN */}
                    <SignedIn>
                        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/analysis" className="text-muted-foreground hover:text-foreground transition-colors">
                            AI Review
                        </Link>
                        <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                            Pricing
                        </Link>
                    </SignedIn>

                    <div className="flex items-center gap-4 ml-2">
                        <SignedIn>
                            <UpgradeButton />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm">
                                    Log in
                                </Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button size="sm">
                                    Sign up
                                </Button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                    </div>
                </nav>

                {/* Mobile Nav */}
                <MobileNav />
            </div>
        </header>
    );
}

/** Links in the mobile sheet, sized for touch and closing the sheet on tap. */
function MobileNavLink({
    href,
    children,
    onNavigate,
}: {
    href: string;
    children: React.ReactNode;
    onNavigate: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            // min-h-11 keeps every row at a comfortable touch target.
            className="flex items-center min-h-11 px-3 -mx-3 rounded-lg text-base font-medium text-foreground hover:bg-accent active:bg-accent transition-colors"
        >
            {children}
        </Link>
    );
}

function MobileNav() {
    // Controlled so tapping a link closes the sheet. Radix does not close on
    // client-side navigation by itself, which left the menu covering the page.
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <div className="flex flex-col gap-6 h-full">
                    <Link href="/" onClick={close} className="flex items-center space-x-2 pr-8">
                        <img src="/logo.svg" alt="Shortlist Logo" className="h-5 w-5 text-primary" />
                        <span className="font-heading text-lg font-bold">Shortlist</span>
                    </Link>

                    <nav className="flex flex-col gap-1">
                        <SignedOut>
                            <MobileNavLink href="/#features" onNavigate={close}>Features</MobileNavLink>
                            <MobileNavLink href="/#how-it-works" onNavigate={close}>How it Works</MobileNavLink>
                            <MobileNavLink href="/#pricing" onNavigate={close}>Pricing</MobileNavLink>
                        </SignedOut>

                        <SignedIn>
                            <MobileNavLink href="/dashboard" onNavigate={close}>Dashboard</MobileNavLink>
                            <MobileNavLink href="/dashboard/resumes" onNavigate={close}>My Resumes</MobileNavLink>
                            <MobileNavLink href="/dashboard/cover-letters" onNavigate={close}>Cover Letters</MobileNavLink>
                            <MobileNavLink href="/dashboard/reviews" onNavigate={close}>AI Reviews</MobileNavLink>
                            <MobileNavLink href="/pricing" onNavigate={close}>Pricing</MobileNavLink>
                        </SignedIn>
                    </nav>

                    <div className="flex flex-col gap-2 mt-auto pt-4 border-t">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant="outline" className="w-full">Log in</Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button className="w-full">Sign up</Button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <Button asChild variant="outline" className="w-full gap-2 justify-center">
                                <Link href="/pricing" onClick={close}>
                                    <Crown className="w-4 h-4 text-amber-500" />
                                    Upgrade to Pro
                                </Link>
                            </Button>
                            <div className="flex items-center gap-3 pt-2">
                                <UserButton afterSignOutUrl="/" />
                                <span className="text-sm font-medium">Account</span>
                            </div>
                        </SignedIn>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
