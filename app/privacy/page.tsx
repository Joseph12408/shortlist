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
          <p className="text-sm text-muted-foreground mb-8">Last updated: 17 September 2026</p>

          <section className="mb-8">
            <p>
              This Privacy Policy explains how Shortlist (&quot;Shortlist&quot;, &quot;we&quot;,
              &quot;us&quot;) collects, uses, shares, and protects your information when you
              use our resume and cover-letter builder at shortlist.ink and related
              services (the &quot;Service&quot;). By using the Service, you agree to the
              practices described here.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p>We collect the following categories of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account information.</strong> When you sign up, our
                authentication provider (Clerk) collects your name, email address,
                password or social-login identifier, and profile photo where provided.
              </li>
              <li>
                <strong>Resume and cover-letter content.</strong> Everything you enter
                into or upload to the builder: your full name, email, phone number,
                location, links, professional summary, and your employment, education,
                leadership, project, and skills history, along with any cover letters you
                create.
              </li>
              <li>
                <strong>Job descriptions.</strong> Text you paste in to have your resume
                scanned or optimized against a specific role.
              </li>
              <li>
                <strong>Contact messages.</strong> If you use our contact form, we collect
                your name, email, the category of your message, and its contents.
              </li>
              <li>
                <strong>Subscription and usage data.</strong> Your plan status, and counters
                for features such as AI reviews, job scans, and exports, used to enforce
                free-tier limits and provide your history.
              </li>
              <li>
                <strong>Payment information.</strong> Payments are handled by our third-party
                payment processor. We do <em>not</em> receive or store your full card
                details; we store only your subscription status and a membership
                identifier.
              </li>
              <li>
                <strong>Technical and device data.</strong> IP address, browser and device
                information, and diagnostic/error data, used for security, abuse
                prevention, and reliability.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and operate the Service, including saving your resumes and cover letters and syncing them across your devices.</li>
              <li>To generate AI-assisted resume optimizations, cover letters, and ATS analysis at your request.</li>
              <li>To process your subscription, payments, and entitlements.</li>
              <li>To send you service-related and, where you have not opted out, occasional product emails (see Section 6).</li>
              <li>To respond to your contact-form messages and support requests.</li>
              <li>To secure the Service, enforce usage limits, prevent abuse, and debug errors.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. AI Processing of Your Content</h2>
            <p>
              When you use an AI feature (optimization, cover-letter generation, or ATS
              review), the relevant resume and job-description text is sent to our AI
              providers, Google (Gemini) and/or OpenAI, solely to produce your result.
              Under their API terms, content submitted through these interfaces is not
              used to train their publicly shared models. We do not use your resume
              content to train models of our own.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. How We Share Information</h2>
            <p>
              We do not sell your personal data. We share it only with service providers
              (&quot;subprocessors&quot;) who process it on our behalf to run the Service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Clerk</strong> — authentication and account management.</li>
              <li><strong>Convex</strong> — database storage of your resumes, cover letters, and history.</li>
              <li><strong>Vercel</strong> — application hosting and content delivery.</li>
              <li><strong>Google (Gemini) and OpenAI</strong> — AI generation and analysis of the content you submit.</li>
              <li><strong>Whop</strong> — subscription checkout and payment processing.</li>
              <li><strong>Resend</strong> — delivery of transactional and product emails.</li>
              <li><strong>Arcjet</strong> — security, rate limiting, and bot detection (processes IP address).</li>
              <li><strong>Sentry</strong> — error monitoring and diagnostics.</li>
              <li><strong>PostHog</strong> — privacy-respecting product analytics.</li>
            </ul>
            <p>
              We may also disclose information where required by law, to protect our
              rights, or in connection with a merger, acquisition, or sale of assets.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Cookies and Local Storage</h2>
            <p>
              We use cookies and browser local storage to keep you signed in, remember your
              preferences, and store a local copy of your work so the app is fast and
              works across sessions. Analytics and security providers may set their own
              cookies. You can control cookies through your browser settings, though some
              features may not work without them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Email Communications</h2>
            <p>
              We send transactional emails (such as account and onboarding messages) and,
              unless you opt out, occasional product emails. Every marketing email includes
              an unsubscribe link, and you can opt out at any time; we will still send
              essential service messages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p>
              We keep your account and content for as long as your account is active. If you
              delete a resume, cover letter, or your account, we delete the associated
              content from our active systems, subject to short-lived backups and any
              records we must retain to meet legal or accounting obligations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, or destruction,
              including encryption in transit and access controls at our providers. However,
              no method of transmission or storage is completely secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Your Rights and Choices</h2>
            <p>
              Depending on where you live, you may have the right to access, correct, export,
              or delete your personal information, and to object to or restrict certain
              processing. You can:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and edit your resumes, cover letters, and profile directly in your dashboard.</li>
              <li>Delete individual resumes or cover letters, or request full account deletion.</li>
              <li>Unsubscribe from product emails using the link in any such email.</li>
              <li>Contact us to exercise any of these rights (see Section 12).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
            <p>
              Our providers may process and store your information in countries other than
              your own, including the United States. Where required, we rely on appropriate
              safeguards for these transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Children&apos;s Privacy</h2>
            <p>
              The Service is not directed to children under 16, and we do not knowingly
              collect personal information from them. If you believe a child has provided us
              with personal information, please contact us and we will delete it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p>
              For any questions, requests, or concerns about this Privacy Policy or your
              data, please reach us through our{' '}
              <a href="/contact" className="underline hover:no-underline">contact page</a>{' '}
              or at privacy@shortlist.ink.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise
              the &quot;Last updated&quot; date above, and material changes may be
              communicated through the Service.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
