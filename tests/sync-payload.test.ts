/**
 * Guards the cross-device sync path.
 *
 * Resumes that had been sitting in localStorage since older builds were pushed
 * to Convex raw. Any field the validator required but the old record lacked
 * rejected the entire write, which is one of the ways work stayed stranded on a
 * single machine. Every field is coerced now, and this pins that down.
 */
import { toResumePayload, toCoverLetterPayload } from '../lib/resume-utils';

let failures = 0;
const check = (name: string, cond: boolean) => {
    if (!cond) failures++;
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
};

// A record from an older build: no leadership, no website, partial entries.
const legacy: any = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    profile: { fullName: 'Jane Mwangi', email: 'jane@example.com' },
    experience: [{ id: 'e1', title: 'Data Analyst', company: 'Acme' }],
    education: [{ id: 'ed1', institution: 'UB' }],
    skills: [{ id: 's1', category: 'Tools' }],
};

const p: any = toResumePayload(legacy);

const requiredProfileFields = ['fullName', 'email', 'phone', 'location', 'website', 'linkedin', 'summary'];
check(
    'every required profile field is a string',
    requiredProfileFields.every((f) => typeof p.profile[f] === 'string')
);
check('profile values are preserved', p.profile.fullName === 'Jane Mwangi' && p.profile.email === 'jane@example.com');

check('missing arrays become empty arrays', Array.isArray(p.leadership) && p.leadership.length === 0);
check('projects default to an empty array', Array.isArray(p.projects) && p.projects.length === 0);

const exp = p.experience[0];
check('experience keeps what it had', exp.title === 'Data Analyst' && exp.company === 'Acme');
check('experience fills what it lacked', exp.location === '' && exp.description === '' && exp.current === false);

const edu = p.education[0];
check('education fills what it lacked', edu.degree === '' && edu.fieldOfStudy === '' && edu.current === false);

const skill = p.skills[0];
check('skill group gets an array', Array.isArray(skill.skills) && skill.skills.length === 0);

check('an untitled resume is named from its content', p.title === 'Jane Mwangi, Data Analyst');

// customStyles must be complete or absent: a half-filled object is rejected.
check('incomplete customStyles is dropped', toResumePayload({ ...legacy, customStyles: { accentColor: '#000' } } as any).customStyles === undefined);
check(
    'complete customStyles survives',
    (toResumePayload({
        ...legacy,
        customStyles: { accentColor: '#000', fontBody: 'Inter', fontHeading: 'Outfit', theme: 'modern' },
    } as any).customStyles as any)?.theme === 'modern'
);

// Cover letters.
const cl: any = { id: 'draft', jobTitle: 'Analyst', company: 'Acme' };
const clp = toCoverLetterPayload(cl);
check('cover letter is named from the job it targets', clp.title === 'Analyst at Acme');
check('cover letter body defaults to empty', clp.body === '' && clp.recipient === '');
check('a bare cover letter still gets a title', toCoverLetterPayload({}).title === 'Untitled Cover Letter');

console.log(failures === 0 ? '\nAll sync payload checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
