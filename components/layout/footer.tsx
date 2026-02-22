import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t bg-background">
            <div className="container py-8 md:py-12">
                <div className="flex flex-col md:flex-row justify-center items-center gap-12 text-center">
                    <div className="max-w-xs">
                        <span className="font-heading text-xl font-bold tracking-tight">
                            Shortlist
                        </span>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Build resumes that actually get shortlisted.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
                            <li><Link href="#pricing" className="hover:text-foreground">Pricing</Link></li>
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
                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Shortlist. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
