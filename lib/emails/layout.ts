import { SITE_URL } from "@/lib/resend";

/**
 * Shared shell for every email we send.
 *
 * Deliberately plain HTML with inline styles: email clients strip <style>
 * blocks, ignore most modern CSS, and Outlook renders through Word. Tables and
 * inline styles are the only reliably portable option.
 */
export function renderEmail(opts: {
    /** Preview text shown in the inbox list next to the subject. */
    preheader: string;
    /** Body HTML, already escaped. */
    body: string;
    /** Marketing mail must carry an unsubscribe link. Transactional need not. */
    unsubscribeUrl?: string;
}): string {
    const { preheader, body, unsubscribeUrl } = opts;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Shortlist</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preheader: shown in the inbox preview, hidden in the body. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;">
          <tr>
            <td style="padding:32px 32px 24px 32px;">
              <div style="font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.02em;">Shortlist</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px 32px;color:#334155;font-size:15px;line-height:1.65;">
${body}
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="padding:24px 32px;text-align:center;color:#94a3b8;font-size:12px;line-height:1.6;">
              <p style="margin:0 0 8px 0;">
                Shortlist does not guarantee employment. It optimizes resumes using ATS standards and best practices.
              </p>
              ${
                  unsubscribeUrl
                      ? `<p style="margin:0;"><a href="${unsubscribeUrl}" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a></p>`
                      : `<p style="margin:0;"><a href="${SITE_URL}" style="color:#94a3b8;text-decoration:underline;">shortlist.ink</a></p>`
              }
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Primary call-to-action button. Table-based so Outlook renders it. */
export function button(href: string, label: string): string {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:#4f46e5;border-radius:8px;">
      <a href="${href}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">${label}</a>
    </td>
  </tr>
</table>`;
}

/** Escape untrusted values (user names, job titles) before interpolating. */
export function esc(s: string | undefined | null): string {
    if (!s) return "";
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
