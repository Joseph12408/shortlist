/**
 * Locks the fix for the self-heal Pro leak.
 *
 * The bug: /api/subscription/check queried Whop for memberships and granted Pro
 * (and permanently stamped Clerk metadata) on ANY active membership in the
 * response, without checking it belonged to the caller. When Whop's ?email=
 * filter returned the whole account's memberships, every free user who shared
 * the account with one paying member was upgraded. These checks assert that a
 * membership only ever counts when it belongs to the caller's own email.
 */
import { findActiveMembership, isActiveMembershipForEmail } from '../lib/whop-membership';

let failures = 0;
function check(name: string, cond: boolean) {
    if (!cond) failures++;
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
}

const ME = 'free.user@example.com';
const OTHER = 'paying.member@example.com';

// --- The leak itself ---
check(
    'a stranger\'s active membership does NOT grant Pro (the bug)',
    findActiveMembership({ data: [{ id: 'mem_stranger', email: OTHER, valid: true, status: 'active' }] }, ME) === null
);
check(
    'unfiltered company list: caller with no membership gets nothing',
    findActiveMembership(
        { data: [
            { id: 'a', email: OTHER, valid: true },
            { id: 'b', email: 'someone@else.com', status: 'active' },
        ] },
        ME
    ) === null
);

// --- Legitimate Pro still works ---
check(
    'the caller\'s own active membership grants Pro',
    findActiveMembership({ data: [{ id: 'mem_mine', email: ME, valid: true }] }, ME)?.id === 'mem_mine'
);
check(
    'email match is case-insensitive',
    findActiveMembership({ items: [{ id: 'm', email: ME.toUpperCase(), status: 'active' }] }, ME)?.id === 'm'
);
check(
    'membership nested under user.email is matched',
    findActiveMembership([{ id: 'm2', user: { email: ME }, valid: true }], ME)?.id === 'm2'
);
check(
    'picks the caller out of a mixed company response',
    findActiveMembership(
        { data: [
            { id: 'a', email: OTHER, valid: true },
            { id: 'c', email: ME, valid: true },
        ] },
        ME
    )?.id === 'c'
);

// --- Fail-closed edge cases ---
check(
    'a membership with no email is never matched',
    findActiveMembership([{ id: 'm3', valid: true, status: 'active' }], ME) === null
);
check(
    'matching email but inactive status does not grant Pro',
    findActiveMembership([{ id: 'm4', email: ME, status: 'expired' }], ME) === null
);
check(
    'an empty response grants nothing',
    findActiveMembership({ data: [] }, ME) === null
);
check(
    'a missing email argument grants nothing',
    findActiveMembership([{ email: ME, valid: true }], '') === null
);
check(
    'isActiveMembershipForEmail rejects a mismatched email directly',
    isActiveMembershipForEmail({ email: OTHER, valid: true }, ME) === false
);

console.log(failures === 0 ? '\nAll entitlement checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
