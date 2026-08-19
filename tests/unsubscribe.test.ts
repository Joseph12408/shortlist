/**
 * Unsubscribe links are the only thing standing between a signed token and
 * someone opting a stranger out, so verify the signing holds up.
 */
process.env.EMAIL_UNSUBSCRIBE_SECRET =
    process.env.EMAIL_UNSUBSCRIBE_SECRET || "test-secret-for-local-runs";

import { signEmail, verifyEmailToken, unsubscribeUrl } from '../lib/emails/unsubscribe';

let failures = 0;
const check = (name: string, cond: boolean) => {
    if (!cond) failures++;
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
};

const email = 'jane@example.com';
const token = signEmail(email);

check('valid token verifies', verifyEmailToken(email, token));
check('token is not the raw email', !token.includes('jane'));
check('wrong token is rejected', !verifyEmailToken(email, 'a'.repeat(32)));
check('empty token is rejected', !verifyEmailToken(email, ''));
check('truncated token is rejected', !verifyEmailToken(email, token.slice(0, 16)));

// The important one: a token for one address must not opt out another.
check(
    "another user's token is rejected",
    !verifyEmailToken('victim@example.com', token)
);

// Addresses are normalised, so casing and padding must not break the link.
check('casing is normalised', verifyEmailToken('JANE@example.com', token));
check('surrounding whitespace is normalised', verifyEmailToken('  jane@example.com  ', token));

const url = unsubscribeUrl(email);
check('url is absolute', url.startsWith('https://'));
check('url carries the address', url.includes('jane%40example.com'));
check('url carries the token', url.includes(token));

console.log(`\nexample: ${url}`);
console.log(failures === 0 ? '\nAll unsubscribe checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
