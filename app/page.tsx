import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Rubric } from "@/components/landing/rubric";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Tailor } from "@/components/landing/tailor";
import { TemplateShowcase } from "@/components/landing/template-showcase";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { CTASection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <div className="ld flex min-h-screen flex-col font-sans">
      <main className="flex-1">
        <Hero />
        <Rubric />
        <HowItWorks />
        <Tailor />
        <TemplateShowcase />
        <Pricing />
        <Faq />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
