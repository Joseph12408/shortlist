import { renderEmail, esc } from "./layout";

/** Human-readable labels for the category stored on the message. */
const CATEGORY_LABELS: Record<string, string> = {
    question: "Question",
    suggestion: "Suggestion",
    problem: "Problem",
    other: "Other",
};

/**
 * Build the internal notification email for a new contact-form submission.
 *
 * Transactional (goes to the team, not the user), so it carries no unsubscribe
 * link. Every user-supplied value is escaped before interpolation; the message
 * body additionally keeps its line breaks by turning newlines into <br> after
 * escaping.
 */
export function contactNotificationEmail(input: {
    name: string;
    email: string;
    category: string;
    message: string;
}): { subject: string; html: string } {
    const categoryLabel = CATEGORY_LABELS[input.category] ?? "Message";

    const subject = `New ${categoryLabel.toLowerCase()} from ${input.name}`;

    const messageHtml = esc(input.message).replace(/\r?\n/g, "<br>");

    const body = `
<p style="margin:0 0 16px 0;">You have a new message from the Shortlist contact form.</p>

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px 0;font-size:14px;color:#334155;">
  <tr>
    <td style="padding:6px 0;width:90px;color:#64748b;">Name</td>
    <td style="padding:6px 0;font-weight:600;">${esc(input.name)}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#64748b;">Email</td>
    <td style="padding:6px 0;"><a href="mailto:${esc(input.email)}" style="color:#4f46e5;text-decoration:none;">${esc(input.email)}</a></td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#64748b;">About</td>
    <td style="padding:6px 0;">${esc(categoryLabel)}</td>
  </tr>
</table>

<div style="border-left:3px solid #e2e8f0;padding:4px 0 4px 16px;color:#0f172a;font-size:15px;line-height:1.65;">
${messageHtml}
</div>

<p style="margin:24px 0 0 0;font-size:13px;color:#94a3b8;">Reply straight to this email to reach ${esc(input.name)}.</p>
`;

    return {
        subject,
        html: renderEmail({
            preheader: `${categoryLabel} from ${input.name}`,
            body,
        }),
    };
}
