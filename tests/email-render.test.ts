/**
 * Renders every sequence step to disk and asserts the invariants that matter
 * for deliverability and compliance. No network, no API key needed.
 */
import fs from 'fs';
import path from 'path';
import { SEQUENCE, Recipient } from '../lib/emails/sequence';

const OUT_DIR = path.join(__dirname, 'output', 'emails');

const recipient: Recipient = {
    email: 'jane@example.com',
    firstName: 'Jane',
    unsubscribeUrl: 'https://www.shortlist.ink/unsubscribe?t=demo-token',
};

// A hostile display name: if this survives unescaped the email is XSS-prone
// and will also trip spam filters.
const hostile: Recipient = {
    email: 'x@example.com',
    firstName: '<script>alert(1)</script>',
    unsubscribeUrl: 'https://www.shortlist.ink/unsubscribe?t=demo-token',
};

let failures = 0;
const check = (name: string, cond: boolean) => {
    if (!cond) failures++;
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
};

fs.mkdirSync(OUT_DIR, { recursive: true });

check('sequence has at least one step', SEQUENCE.length > 0);

const ids = SEQUENCE.map((s) => s.id);
check('step ids are unique', new Set(ids).size === ids.length);

for (const step of SEQUENCE) {
    const html = step.html(recipient);
    const subject = step.subject(recipient);
    fs.writeFileSync(path.join(OUT_DIR, `${step.id}.html`), html);

    console.log(`\n--- ${step.id} (${step.kind}, day ${step.delayDays}) ---`);
    console.log(`subject: ${subject}`);

    check(`${step.id}: subject is non-empty`, subject.trim().length > 0);
    check(`${step.id}: subject is not overlong`, subject.length <= 78);
    check(`${step.id}: has a preheader`, html.includes('display:none;max-height:0'));
    check(`${step.id}: uses inline styles, no <style> block`, !/<style[\s>]/i.test(html));
    check(`${step.id}: personalises the greeting`, html.includes('Jane'));
    check(`${step.id}: carries the PRD disclaimer`, html.includes('does not guarantee employment'));
    check(`${step.id}: links are absolute`, !/href="\/(?!\/)/.test(html));

    // Marketing mail legally requires an unsubscribe path; transactional does not.
    if (step.kind === 'marketing') {
        check(`${step.id}: marketing step includes unsubscribe`, html.includes(recipient.unsubscribeUrl!));
    }

    // Escaping check.
    const hostileHtml = step.html(hostile);
    check(`${step.id}: escapes hostile display names`, !hostileHtml.includes('<script>'));
}

console.log(`\nWrote ${OUT_DIR}`);
console.log(failures === 0 ? 'All email checks passed.' : `${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
