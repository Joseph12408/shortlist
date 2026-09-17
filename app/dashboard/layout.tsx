import { Footer } from "@/components/layout/footer";

/**
 * Wraps every /dashboard page so the site footer sits at the bottom, matching
 * the rest of the app. The column keeps the footer below the content on short
 * pages rather than floating it up into the middle.
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
        </div>
    );
}
