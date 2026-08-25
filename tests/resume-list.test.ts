/**
 * Guards the resume/cover-letter list behaviour Joseph reported: blank entries
 * being persisted, and every card falling back to a placeholder title.
 */
import { isResumeEmpty, deriveResumeTitle } from '../lib/resume-utils';

let failures = 0;
const check = (name: string, cond: boolean) => {
    if (!cond) failures++;
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
};

const blank: any = {
    id: 'x', title: 'Resume #1',
    profile: { fullName: '', email: '', phone: '', location: '', website: '', linkedin: '', summary: '' },
    education: [], experience: [], leadership: [], projects: [], skills: [],
};

check('a freshly created resume counts as empty', isResumeEmpty(blank));
check('undefined counts as empty', isResumeEmpty(undefined));
check('a name alone makes it non-empty', !isResumeEmpty({ ...blank, profile: { ...blank.profile, fullName: 'Jane' } }));
check('whitespace only is still empty', isResumeEmpty({ ...blank, profile: { ...blank.profile, fullName: '   ' } }));
check('one experience makes it non-empty', !isResumeEmpty({ ...blank, experience: [{ id: '1' }] }));
check('one skill group makes it non-empty', !isResumeEmpty({ ...blank, skills: [{ id: '1' }] }));

const named: any = {
    ...blank,
    profile: { ...blank.profile, fullName: 'Jane Mwangi' },
    experience: [{ id: '1', title: 'Data Analyst', company: 'Acme' }],
};

check('title combines name and role', deriveResumeTitle(named) === 'Jane Mwangi, Data Analyst');
check('role alone is used', deriveResumeTitle({ ...blank, experience: [{ id: '1', title: 'Designer' }] } as any) === 'Designer');
check('name alone is used', deriveResumeTitle({ ...blank, profile: { ...blank.profile, fullName: 'Jane' } } as any) === "Jane's Resume");
check('falls back only when there is nothing', deriveResumeTitle(blank) === 'Untitled Resume');
check('derived title contains no em dash', !deriveResumeTitle(named).includes('\u2014'));

console.log(failures === 0 ? '\nAll resume list checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
