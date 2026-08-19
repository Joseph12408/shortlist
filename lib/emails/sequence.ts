import { renderEmail, button, esc } from "./layout";
import { SITE_URL } from "@/lib/resend";
import { FREE_MONTHLY_JOB_SCANS } from "@/lib/tiers";

/**
 * The signup onboarding sequence.
 *
 * Step 1 sends immediately; the rest are handed to Resend with a future
 * `scheduledAt`, so delivery timing is Resend's job rather than ours.
 *
 * `kind` is a legal distinction, not a cosmetic one:
 *   transactional - a direct response to a user action. No unsubscribe needed.
 *   marketing     - promotional. MUST carry an unsubscribe link (CAN-SPAM,
 *                   GDPR, and Gmail's bulk sender rules).
 */
export interface Recipient {
    email: string;
    firstName?: string | null;
    /** Per-recipient unsubscribe URL, required for marketing steps. */
    unsubscribeUrl?: string;
}

export interface EmailStep {
    id: string;
    /** Days after signup. 0 sends immediately. */
    delayDays: number;
    kind: "transactional" | "marketing";
    subject: (r: Recipient) => string;
    html: (r: Recipient) => string;
}

const greeting = (r: Recipient) =>
    r.firstName ? `Hi ${esc(r.firstName)},` : "Hi,";

const signoff = (extra?: string) => `
<p style="margin:24px 0 0 0;">Joseph<br>
<span style="color:#64748b;font-size:14px;">Founder, shortlist.ink</span></p>
${extra ? `<p style="margin:16px 0 0 0;color:#64748b;font-size:14px;">${extra}</p>` : ""}`;

export const SEQUENCE: EmailStep[] = [
    {
        id: "welcome",
        delayDays: 0,
        kind: "marketing",
        subject: () => "Your free resume score is waiting 🎯",
        html: (r) =>
            renderEmail({
                preheader: "Most resumes fail before a human ever reads them.",
                unsubscribeUrl: r.unsubscribeUrl,
                body: `
<p style="margin:0 0 16px 0;">${greeting(r)}</p>

<p style="margin:0 0 16px 0;">
  Welcome to shortlist.ink. Great to have you here.
</p>

<p style="margin:0 0 16px 0;">
  Here's the truth most job seekers never hear: most resumes fail before a
  human ever reads them. Not because they're bad, but because they're not
  speaking the ATS's language.
</p>

<p style="margin:0 0 16px 0;">
  Your first scan takes about a minute. Upload your resume, and you'll see
  exactly where yours stands and what's holding it back.
</p>

${button(`${SITE_URL}/analysis`, "Score My Resume")}

<p style="margin:0 0 16px 0;">
  Over the next few days I'll share a few things that help people get the
  most out of shortlist.ink. Short emails, nothing spammy.
</p>

<p style="margin:0 0 16px 0;">
  First one lands tomorrow. It's about the #1 keyword mistake that tanks
  ATS scores, and it's not what you'd expect.
</p>

${signoff(
    "P.S. If your score comes back lower than you expected, that's actually a good sign. It means there's a clear, fixable gap between where you are and where you need to be. We can help you close it."
)}`,
            }),
    },

    {
        id: "keyword-mistake",
        delayDays: 1,
        kind: "marketing",
        subject: () => "The keyword mistake that's quietly killing your applications",
        html: (r) =>
            renderEmail({
                preheader: "Adding more keywords is not the answer.",
                unsubscribeUrl: r.unsubscribeUrl,
                body: `
<p style="margin:0 0 16px 0;">${greeting(r)}</p>

<p style="margin:0 0 16px 0;">Here's something that surprises almost everyone:</p>

<p style="margin:0 0 16px 0;"><strong>Adding more keywords is not the answer.</strong></p>

<p style="margin:0 0 16px 0;">
  ATS systems don't just scan for keywords, they look for context around
  them. "Managed a team" scores lower than "Managed a cross-functional team
  of 8 engineers to deliver X."
</p>

<p style="margin:0 0 16px 0;">The keyword is the same. The score is not.</p>

<p style="margin:0 0 16px 0;">
  This is why shortlist.ink doesn't just tell you what's missing. It shows
  you <em>where</em> in your resume to add it, and how to phrase it in a way
  that registers as relevant, not stuffed.
</p>

<p style="margin:0 0 8px 0;"><strong>Three quick wins to try right now:</strong></p>
<ol style="margin:0 0 16px 0;padding-left:20px;">
  <li style="margin-bottom:8px;">
    Match the exact job title in your summary. If it's a stretch, use their
    version in the summary and yours in the experience section.
  </li>
  <li style="margin-bottom:8px;">
    Mirror the action verbs from the job description. "Spearheaded" and "led"
    actually score differently.
  </li>
  <li>
    Add a Skills section if you don't have one. ATS systems weight dedicated
    skills sections heavily.
  </li>
</ol>

${button(`${SITE_URL}/analysis`, "Re-run your resume with these changes")}

<p style="margin:0 0 16px 0;">
  Tomorrow: how to use the Job Match feature to stop applying blindly.
</p>

${signoff()}`,
            }),
    },

    {
        id: "stop-applying-blindly",
        delayDays: 3,
        kind: "marketing",
        subject: () => "Stop applying to jobs blindly (do this instead)",
        html: (r) =>
            renderEmail({
                preheader: "Fewer applications, tuned to each job, beats 50 generic ones.",
                unsubscribeUrl: r.unsubscribeUrl,
                body: `
<p style="margin:0 0 16px 0;">${greeting(r)}</p>

<p style="margin:0 0 16px 0;">
  Most people apply to 30 to 50 jobs with the same resume.
</p>

<p style="margin:0 0 16px 0;">
  The ones who get callbacks? They apply to fewer jobs with a resume tuned
  to each one.
</p>

<p style="margin:0 0 8px 0;">
  shortlist.ink's job matching feature is built for exactly this. Paste the
  job description, and we show you:
</p>
<ul style="margin:0 0 16px 0;padding-left:20px;">
  <li style="margin-bottom:6px;">Which requirements your resume covers</li>
  <li style="margin-bottom:6px;">Which ones it's missing entirely</li>
  <li>The specific language to add to close the gap</li>
</ul>

<p style="margin:0 0 16px 0;">
  It takes 5 minutes. It meaningfully changes your response rate.
</p>

${button(`${SITE_URL}/builder`, "Try the Job Match feature now")}

<p style="margin:0 0 16px 0;">
  If you're on the free tier, you get ${FREE_MONTHLY_JOB_SCANS} matches per
  month. That's enough to be strategic rather than scattered.
</p>

<p style="margin:0 0 16px 0;">
  One thing worth knowing: the people who get the most out of shortlist.ink
  aren't applying to 50 jobs. They're applying to 10 really well.
</p>

${signoff(
    "P.S. The gap between 10 targeted applications and 50 generic ones usually shows up within a fortnight."
)}`,
            }),
    },

    {
        id: "week-one-checkin",
        delayDays: 7,
        kind: "marketing",
        subject: () => "Quick check-in, how's the job search going?",
        html: (r) =>
            renderEmail({
                preheader: "A fast summary of everything available to you.",
                unsubscribeUrl: r.unsubscribeUrl,
                body: `
<p style="margin:0 0 16px 0;">${greeting(r)}</p>

<p style="margin:0 0 16px 0;">
  It's been a week since you joined shortlist.ink. Wanted to check in.
</p>

<p style="margin:0 0 16px 0;">
  If you've been using it, great. If life got busy and you haven't, totally
  normal.
</p>

<p style="margin:0 0 8px 0;">
  Either way, here's a fast summary of what's available to you:
</p>
<ul style="margin:0 0 16px 0;padding-left:20px;list-style:none;">
  <li style="margin-bottom:6px;">&#10003; ATS Score, see how your resume ranks before applying</li>
  <li style="margin-bottom:6px;">&#10003; Job Match, tailor your resume to any job description</li>
  <li>&#10003; Keyword Gap Analysis, know exactly what's missing</li>
</ul>

<p style="margin:0 0 16px 0;">
  Free tier gives you access to all three, with a monthly limit on matches.
</p>

<p style="margin:0 0 16px 0;">
  If you're job hunting seriously and want unlimited access:
</p>

${button(`${SITE_URL}/pricing`, "See shortlist.ink Pro")}

<p style="margin:0 0 16px 0;">
  Whether or not Pro makes sense for you, I hope the free tools have been
  useful. This stuff genuinely works when people use it.
</p>

<p style="margin:24px 0 0 0;">Rooting for you,<br>Joseph</p>

<p style="margin:16px 0 0 0;color:#64748b;font-size:14px;">
  P.S. If you've already landed interviews off the back of this, that's the
  whole point. Go get the next one.
</p>`,
            }),
    },
];

/** Steps that fire immediately when a user signs up. */
export const IMMEDIATE_STEPS = SEQUENCE.filter((s) => s.delayDays === 0);

/** Steps handed to Resend with a future scheduledAt. */
export const DELAYED_STEPS = SEQUENCE.filter((s) => s.delayDays > 0);

export function getStep(id: string): EmailStep | undefined {
    return SEQUENCE.find((s) => s.id === id);
}
