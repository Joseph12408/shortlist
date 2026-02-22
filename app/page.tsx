import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { AnalysisPreview } from "@/components/landing/analysis-preview";
import { CTASection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <main className="flex-1">
        <Hero />
        <Features />
        <AnalysisPreview />
        <Pricing />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
