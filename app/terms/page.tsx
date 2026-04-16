import { Metadata } from 'next';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Terms of Service - Shortlist',
  description: 'Terms of Service for Shortlist Resume Builder.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-stone dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Shortlist ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>Shortlist provides a platform for users to create, edit, and export resumes and cover letters using AI-assisted tools and templates. The Service is provided "as is" and "as available".</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You retain all rights to the personal data you provide, including your work history and education.</li>
              <li>You grant Shortlist a license to process your data for the sole purpose of rendering the Service (e.g., generating PDFs, providing AI suggestions).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Pro Subscription and Payments</h2>
            <p>Certain features (e.g., unlimited PDF exports, premium templates) are available with a Pro subscription. Payments are processed securely via third-party providers. Subscriptions are billed in advance and are non-refundable except where required by law.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upload malicious code or disrupt the Service's integrity.</li>
              <li>Generate deceptive, fraudulent, or illegal documents.</li>
              <li>Attempt to scrape, reverse-engineer, or circumvent access controls.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p>Shortlist shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits or opportunities, resulting from your use of the Service or reliance on AI-generated content.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
            <p>If you have any questions about these Terms, please contact us at support@shortlist.ink.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
