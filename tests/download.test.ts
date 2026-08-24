/**
 * Verifies the cross-platform download helper, in particular the iOS branch,
 * which is the path that was silently failing for most users.
 *
 * Runs against a minimal DOM stub rather than a real browser so it stays in the
 * fast suite. Only observable behaviour is asserted: which API gets called, and
 * that the object URL is not revoked synchronously.
 */
import { downloadBlob, isIOS } from '../lib/export/download';

let failures = 0;
const check = (name: string, cond: boolean) => {
    if (!cond) failures++;
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
};

const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120';

interface Harness {
    revoked: string[];
    opened: string[];
    clicked: number;
    lastDownloadAttr: string | null;
}

function install(ua: string, popupAllowed = true): Harness {
    const h: Harness = { revoked: [], opened: [], clicked: 0, lastDownloadAttr: null };

    (globalThis as any).navigator = { userAgent: ua };
    (globalThis as any).URL = {
        createObjectURL: () => 'blob:fake-url',
        revokeObjectURL: (u: string) => h.revoked.push(u),
    };
    (globalThis as any).window = {
        open: (u: string) => {
            h.opened.push(u);
            return popupAllowed ? {} : null;
        },
    };
    (globalThis as any).document = {
        // Desktop detection checks `'ontouchend' in document`; keep it absent.
        body: { appendChild() {}, removeChild() {} },
        createElement: () => ({
            style: {},
            set download(v: string) { h.lastDownloadAttr = v; },
            get download() { return h.lastDownloadAttr ?? ''; },
            click: () => { h.clicked++; },
        }),
    };
    return h;
}

// --- iOS ---
let h = install(IOS_UA);
check('detects iPhone as iOS', isIOS());
let result = downloadBlob(new Blob(['x']) as any, 'resume.pdf');
check('iOS opens a new tab instead of using download attribute', h.opened.length === 1);
check('iOS never clicks a synthetic anchor', h.clicked === 0);
check('iOS reports openedInNewTab', result.openedInNewTab === true);
check('iOS reports not blocked when popup allowed', result.blocked === false);
check('object URL is NOT revoked synchronously', h.revoked.length === 0);

// --- iOS with popup blocked ---
h = install(IOS_UA, false);
result = downloadBlob(new Blob(['x']) as any, 'resume.pdf');
check('blocked popup is reported', result.blocked === true);
check('blocked popup does not claim a tab opened', result.openedInNewTab === false);

// --- Desktop ---
h = install(DESKTOP_UA);
check('desktop is not detected as iOS', !isIOS());
result = downloadBlob(new Blob(['x']) as any, 'resume.pdf');
check('desktop clicks an anchor', h.clicked === 1);
check('desktop sets the download filename', h.lastDownloadAttr === 'resume.pdf');
check('desktop does not open a tab', h.opened.length === 0);
check('desktop does not revoke synchronously', h.revoked.length === 0);
check('desktop reports a plain download', result.openedInNewTab === false && result.blocked === false);

console.log(failures === 0 ? '\nAll download checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
