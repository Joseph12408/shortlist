import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t bg-background">
            <div className="mx-auto w-full max-w-6xl px-6 py-8 md:py-12">
                <div className="grid gap-10 sm:grid-cols-[1fr_auto_auto] sm:gap-20">
                    <div className="max-w-xs">
                        <span className="font-heading text-xl font-bold tracking-tight">
                            Shortlist
                        </span>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Find the red ink before a recruiter does.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/#features" className="hover:text-foreground">Features</Link></li>
                            <li><Link href="/#pricing" className="hover:text-foreground">Pricing</Link></li>
                            <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
                            <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 pt-6 border-t flex flex-col gap-3 sm:flex-row sm:justify-between text-sm text-muted-foreground">
                    {/* PRD §13, required disclaimer. */}
                    <p className="max-w-xl text-xs leading-relaxed">
                        Shortlist does not guarantee employment. It optimizes resumes using ATS
                        standards and best practices.
                    </p>
                    <p className="text-xs whitespace-nowrap">&copy; {new Date().getFullYear()} Shortlist. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
