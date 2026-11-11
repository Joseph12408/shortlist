/**
 * Locks the fix for the self-heal Pro leak, against the current Whop API.
 *
 * The bug: /api/subscription/check queried Whop for memberships and granted Pro
 * (and permanently stamped Clerk metadata) on ANY active membership in the
 * response, without checking it belonged to the caller. When Whop's ?email=
 * filter returned the whole account's memberships, every free user who shared
 * the account with one paying member was upgraded. These checks assert that a
 * membership only ever counts when it belongs to the caller's own email.
 *
 * Whop API calls are faked; nothing here touches the network.
 */
import {
    findMemberByEmail,
    findActiveMembershipForMember,
    isActiveMembershipForMember,
    lookupWhopMembership,
    WHOP_API_BASE,
} from '../lib/whop-membership';

let failures = 0;
function check(name: string, cond: boolean) {
    if (!cond) failures++;
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
}

const ME = 'free.user@example.com';
const OTHER = 'paying.member@example.com';

// --- Member lookup: the email must match exactly ---
check(
    'a stranger returned by the search is NOT treated as the caller (the bug)',
    findMemberByEmail({ data: [{ id: 'mber_stranger', email: OTHER, status: 'joined' }] }, ME) === null
);
check(
    'unfiltered list: caller with no member record gets nothing',
    findMemberByEmail(
        { data: [
            { id: 'mber_a', email: OTHER },
            { id: 'mber_b', email: 'someone@else.com' },
        ] },
        ME
    ) === null
);
check(
    'picks the caller out of a mixed response',
    findMemberByEmail(
        { data: [
            { id: 'mber_a', email: OTHER },
            { id: 'mber_me', email: ME },
        ] },
        ME
    )?.id === 'mber_me'
);
check(
    'email match is case-insensitive',
    findMemberByEmail({ data: [{ id: 'mber_me', email: ME.toUpperCase() }] }, ME)?.id === 'mber_me'
);
check(
    'a member with a hidden (null) email is never matched',
    findMemberByEmail({ data: [{ id: 'mber_x', email: null }] }, ME) === null
);
check(
    'a member who left is not matched',
    findMemberByEmail({ data: [{ id: 'mber_me', email: ME, status: 'left' }] }, ME) === null
);
check(
    'a missing email argument matches nothing',
    findMemberByEmail({ data: [{ id: 'mber_me', email: ME }] }, '') === null
);

// --- Membership check: must belong to that member and be active ---
check(
    'the member\'s own active membership counts',
    findActiveMembershipForMember({ data: [{ id: 'mem_mine', member_id: 'mber_me', status: 'active' }] }, 'mber_me')?.id === 'mem_mine'
);
check(
    'a trialing membership counts',
    findActiveMembershipForMember({ data: [{ id: 'mem_t', member_id: 'mber_me', status: 'trialing' }] }, 'mber_me')?.id === 'mem_t'
);
check(
    'someone else\'s active membership does NOT count, even if returned',
    findActiveMembershipForMember({ data: [{ id: 'mem_other', member_id: 'mber_other', status: 'active' }] }, 'mber_me') === null
);
check(
    'expired, canceled and past_due memberships do not count',
    ['expired', 'canceled', 'past_due', 'completed'].every(
        (status) => !isActiveMembershipForMember({ member_id: 'mber_me', status }, 'mber_me')
    )
);
check(
    'an empty response grants nothing',
    findActiveMembershipForMember({ data: [] }, 'mber_me') === null
);

// --- End-to-end lookup with a fake Whop API ---
type Routes = Record<string, { status?: number; body?: unknown }>;
function fakeFetch(routes: Routes, seen: string[] = []): typeof fetch {
    return (async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input);
        seen.push(url);
        const headers = new Headers(init?.headers);
        if (headers.get('Authorization') !== 'Bearer test_key') {
            return new Response('unauthorized', { status: 401 });
        }
        const path = url.slice(WHOP_API_BASE.length).split('?')[0];
        const route = routes[path];
        if (!route) return new Response('not found', { status: 404 });
        return new Response(JSON.stringify(route.body ?? {}), { status: route.status ?? 200 });
    }) as typeof fetch;
}

async function e2e() {
    const seen: string[] = [];
    const ok = await lookupWhopMembership(
        ME,
        'test_key',
        fakeFetch(
            {
                '/members': { body: { data: [{ id: 'mber_a', email: OTHER }, { id: 'mber_me', email: ME }] } },
                '/memberships': { body: { data: [{ id: 'mem_mine', member_id: 'mber_me', status: 'active' }] } },
            },
            seen
        )
    );
    check('lookup: paying caller is active with their mem_ ID', ok.status === 'active' && ok.membershipId === 'mem_mine');
    check('lookup: calls the current API (api/v1), never v2', seen.length === 2 && seen.every((u) => u.startsWith('https://api.whop.com/api/v1/') && !u.includes('/v2/')));
    check('lookup: memberships are fetched for the matched member only', seen[1].includes('member_id=mber_me'));

    const stranger = await lookupWhopMembership(
        ME,
        'test_key',
        fakeFetch({
            '/members': { body: { data: [{ id: 'mber_a', email: OTHER }] } },
            '/memberships': { body: { data: [{ id: 'mem_other', member_id: 'mber_a', status: 'active' }] } },
        })
    );
    check('lookup: only a stranger is active -> caller is "none" (the bug)', stranger.status === 'none');

    const lapsed = await lookupWhopMembership(
        ME,
        'test_key',
        fakeFetch({
            '/members': { body: { data: [{ id: 'mber_me', email: ME }] } },
            '/memberships': { body: { data: [{ id: 'mem_mine', member_id: 'mber_me', status: 'expired' }] } },
        })
    );
    check('lookup: lapsed membership -> "none"', lapsed.status === 'none');

    const forbidden = await lookupWhopMembership(ME, 'test_key', fakeFetch({ '/members': { status: 403 } }));
    check('lookup: missing key permission -> "error", not "none"', forbidden.status === 'error');

    const down = await lookupWhopMembership(ME, 'test_key', (async () => {
        throw new Error('network down');
    }) as typeof fetch);
    check('lookup: network failure -> "error"', down.status === 'error');
}

e2e().then(() => {
    console.log(failures === 0 ? '\nAll entitlement checks passed.' : `\n${failures} check(s) failed.`);
    process.exit(failures === 0 ? 0 : 1);
});
