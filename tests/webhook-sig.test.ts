/**
 * Exercises the real Whop webhook signature verifier against forged, stale,
 * tampered and valid requests.
 */
import crypto from 'crypto';
import { verifyWhopSignature } from '../lib/whop-signature';

const SECRET = 'whsec_test_secret';

const body = JSON.stringify({ type: 'membership.activated', data: { email: 'attacker@evil.com', id: 'mem_1' } });
const now = Math.floor(Date.now() / 1000);

function sign(ts: number, payload: string) {
    return crypto.createHmac('sha256', SECRET).update(`${ts}.${payload}`, 'utf8').digest('hex');
}

const cases: Array<[string, string | null, boolean]> = [
    ['valid timestamped signature', `t=${now},v1=${sign(now, body)}`, true],
    ['valid bare digest', crypto.createHmac('sha256', SECRET).update(body, 'utf8').digest('hex'), true],
    ['valid with sha256= prefix', `t=${now},v1=sha256=${sign(now, body)}`, true],
    ['valid, uppercase hex', `t=${now},v1=${sign(now, body).toUpperCase()}`, true],
    ['valid, spaces around parts', `t=${now}, v1=${sign(now, body)}`, true],
    ['NO header (the original hole)', null, false],
    ['empty header', '', false],
    ['forged signature', `t=${now},v1=${'a'.repeat(64)}`, false],
    ['signature from wrong secret', `t=${now},v1=${crypto.createHmac('sha256', 'wrong').update(`${now}.${body}`, 'utf8').digest('hex')}`, false],
    ['replayed / stale timestamp', `t=${now - 3600},v1=${sign(now - 3600, body)}`, false],
    ['future timestamp beyond tolerance', `t=${now + 3600},v1=${sign(now + 3600, body)}`, false],
    ['valid sig but tampered body', `t=${now},v1=${sign(now, '{"type":"other"}')}`, false],
    ['truncated signature', `t=${now},v1=${sign(now, body).slice(0, 20)}`, false],
    ['non-numeric timestamp', `t=abc,v1=${sign(now, body)}`, false],
    ['timestamp only, no signature', `t=${now}`, false],
    ['garbage header', 'not-a-signature', false],
];

let failures = 0;
for (const [name, header, expected] of cases) {
    const got = verifyWhopSignature(body, header, SECRET);
    const ok = got === expected;
    if (!ok) failures++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(36)} accepted=${String(got).padEnd(5)} (expected ${expected})`);
}

console.log(failures === 0 ? '\nSignature verification behaves correctly.' : `\n${failures} case(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
