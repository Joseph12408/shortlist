import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sparkles, UserCircle, Crown } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useState } from "react";
import { Paywall } from "@/components/subscription/Paywall";
import { useSubscriptionStore } from "@/lib/store/useSubscriptionStore";

function UpgradeButton() {
    const [showPaywall, setShowPaywall] = useState(false);
    const { isPro } = useSubscriptionStore();

    if (isPro) return null;

    return (
        <>
            <Button
                onClick={() => setShowPaywall(true)}
                variant="outline"
                size="sm"
                className="hidden md:flex gap-2 border-amber-500/50 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
                <Crown className="w-4 h-4" />
                Upgrade
            </Button>
            <Paywall open={showPaywall} onOpenChange={setShowPaywall} />
        </>
    );
}

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <img src="/logo.svg" alt="Shortlist Logo" className="h-6 w-6 text-primary" style={{ stroke: 'currentColor' }} />
                    <span className="font-heading text-xl font-bold tracking-tight text-foreground">
                        Shortlist
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                        Features
                    </Link>
                    <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                        How it Works
                    </Link>
                    <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                        Pricing
                    </Link>
                    <SignedIn>
                        <Link href="/dashboard" className="text-primary font-semibold hover:text-primary/80 transition-colors ml-4">
                            Dashboard
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
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <div className="flex flex-col gap-6 mt-6">
                            <Link href="/" className="flex items-center space-x-2">
                                <img src="/logo.svg" alt="Shortlist Logo" className="h-5 w-5 text-primary" style={{ stroke: 'currentColor' }} />
                                <span className="font-heading text-lg font-bold">Shortlist</span>
                            </Link>
                            <nav className="flex flex-col gap-4">
                                <Link href="/#features" className="text-base font-medium">
                                    Features
                                </Link>
                                <Link href="/#how-it-works" className="text-base font-medium">
                                    How it Works
                                </Link>
                                <Link href="/#pricing" className="text-base font-medium">
                                    Pricing
                                </Link>
                                <SignedIn>
                                    <Link href="/dashboard" className="text-base font-medium text-primary">
                                        Dashboard
                                    </Link>
                                    <Link href="/dashboard/resumes" className="text-base font-medium text-muted-foreground pl-4">
                                        My Resumes
                                    </Link>
                                    <Link href="/account" className="text-base font-medium text-muted-foreground pl-4">
                                        Account
                                    </Link>
                                </SignedIn>
                                <div className="flex flex-col gap-2 mt-4">
                                    <SignedOut>
                                        <SignInButton mode="modal">
                                            <Button variant="outline" className="w-full">
                                                Log in
                                            </Button>
                                        </SignInButton>
                                        <SignUpButton mode="modal">
                                            <Button className="w-full">
                                                Sign up
                                            </Button>
                                        </SignUpButton>
                                    </SignedOut>
                                    <SignedIn>
                                        <div className="flex items-center gap-2">
                                            <UserButton afterSignOutUrl="/" />
                                            <span className="text-sm font-medium">Account</span>
                                        </div>
                                    </SignedIn>
                                </div>
                            </nav>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
