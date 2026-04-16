import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/layout/footer";

export const metadata = {
    title: "Pricing | Shortlist",
    description: "Simple, honest pricing. Start for free, upgrade when you're ready.",
};

export default function PricingPage() {
    return (
        <div className="flex min-h-screen flex-col font-sans">
            <main className="flex-1">
                <Pricing />
            </main>
            <Footer />
        </div>
    );
}
