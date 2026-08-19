import Link from "next/link";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { verifyEmailToken } from "@/lib/emails/unsubscribe";
import { cancelScheduled } from "@/lib/emails/send";
import { Footer } from "@/components/layout/footer";

export const metadata = {
    title: "Unsubscribe | Shortlist",
    robots: { index: false, follow: false },
};

// Must run per-request: it mutates the suppression list.
export const dynamic = "force-dynamic";

/**
 * One-click unsubscribe target.
 *
 * Reached from an inbox with no session, so the only proof of ownership is the
 * signed token in the link. Gmail and Apple Mail also POST here via the
 * List-Unsubscribe-Post header, which Next serves with the same component.
 */
export default async function UnsubscribePage({
    searchParams,
}: {
    searchParams: Promise<{ e?: string; t?: string }>;
}) {
    const { e: email, t: token } = await searchParams;

    let status: "ok" | "invalid" | "error" = "invalid";

    if (email && token && verifyEmailToken(email, token)) {
        try {
            const url = process.env.NEXT_PUBLIC_CONVEX_URL;
            if (!url) throw new Error("Convex URL not configured");

            const convex = new ConvexHttpClient(url);
            const { cancelIds } = await convex.mutation(api.emailContacts.unsubscribe, {
                email,
            });

            // Stop anything already sitting in Resend's queue for this address.
            if (cancelIds.length > 0) {
                const cancelled = await cancelScheduled(cancelIds);
                console.log(`[UNSUBSCRIBE] Cancelled ${cancelled}/${cancelIds.length} queued emails for ${email}`);
            }

            status = "ok";
        } catch (err) {
            console.error("[UNSUBSCRIBE] Failed:", err);
            status = "error";
        }
    }

    return (
        <div className="flex min-h-screen flex-col font-sans">
            <main className="flex-1 flex items-center justify-center px-6 py-24">
                <div className="max-w-md text-center">
                    {status === "ok" && (
                        <>
                            <h1 className="text-2xl font-bold mb-3">You&apos;re unsubscribed</h1>
                            <p className="text-muted-foreground mb-8">
                                You won&apos;t receive any more onboarding or marketing emails
                                from Shortlist. Account and billing emails will still reach you.
                            </p>
                        </>
                    )}

                    {status === "invalid" && (
                        <>
                            <h1 className="text-2xl font-bold mb-3">This link isn&apos;t valid</h1>
                            <p className="text-muted-foreground mb-8">
                                It may have been altered or truncated by your email client. Email{" "}
                                <a href="mailto:support@shortlist.ink" className="underline">
                                    support@shortlist.ink
                                </a>{" "}
                                and we&apos;ll take you off the list manually.
                            </p>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
                            <p className="text-muted-foreground mb-8">
                                We couldn&apos;t process that just now. Please try again, or email{" "}
                                <a href="mailto:support@shortlist.ink" className="underline">
                                    support@shortlist.ink
                                </a>{" "}
                                and we&apos;ll do it for you.
                            </p>
                        </>
                    )}

                    <Link href="/" className="text-sm font-medium text-primary hover:underline">
                        Back to Shortlist
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
