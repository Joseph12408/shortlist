import { Metadata } from 'next';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Privacy Policy - Shortlist',
  description: 'Privacy Policy for Shortlist Resume Builder.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-stone dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you use Shortlist:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, and authentication data provided by Clerk.</li>
              <li><strong>Resume Data:</strong> Employment history, education, skills, and any other text uploaded or entered into our resume builder.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our templates and AI tools.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, maintain, and improve the Service (including generating resumes and cover letters).</li>
              <li>To process transactions and send related information (managed securely via payment processors).</li>
              <li>To interact with third-party AI APIs (e.g., Google Gemini) solely for the purpose of generating resume optimizations.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Data Sharing and Third Parties</h2>
            <p>We do not sell your personal data. We may share your data with trusted third-party service providers who assist us in operating our application, such as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Authentication Providers:</strong> Clerk (for secure login).</li>
              <li><strong>AI Partners:</strong> Google Gemini (resume text is sent securely for analysis and improvement; it is not used to train global public models).</li>
              <li><strong>Database & Hosting:</strong> Convex and Vercel.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information at any time through your account dashboard. You may also contact us to request data deletion.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
            <p>For any questions or concerns regarding this Privacy Policy or your data, please contact us at privacy@shortlist.ink.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
