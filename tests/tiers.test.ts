/**
 * Checks the tier constants and feedback prioritisation the free/paid split
 * depends on.
 */
import { FREE_TEMPLATES, PRO_TEMPLATES, isTemplateFree, currentPeriod, FREE_MONTHLY_JOB_SCANS, FREE_MONTHLY_EXPORTS } from '../lib/tiers';
import { analyzeResume, prioritizeFeedback } from '../lib/ats/ats-score';

let failures = 0;
function check(name: string, cond: boolean) {
    if (!cond) failures++;
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
}

// --- tiers ---
const all = [...FREE_TEMPLATES, ...PRO_TEMPLATES];
check('no template is both free and pro', new Set(all).size === all.length);
check('all 8 rendered templates are tiered', all.length === 8);
check('standard is free', isTemplateFree('standard'));
check('modern is pro', !isTemplateFree('modern'));
check('unknown template defaults to pro (fails closed)', !isTemplateFree('nonexistent'));
check('period format is YYYY-MM', /^\d{4}-\d{2}$/.test(currentPeriod()));
check('period pads single-digit months', currentPeriod(new Date(Date.UTC(2026, 0, 15))) === '2026-01');
check('scan limit is 5', FREE_MONTHLY_JOB_SCANS === 5);
check('export limit is 3', FREE_MONTHLY_EXPORTS === 3);

// --- feedback tiering ---
const weakResume: any = {
    profile: { fullName: 'A', email: '', phone: '', location: '', website: '', linkedin: '', summary: '' },
    education: [], experience: [], leadership: [], projects: [], skills: [],
};
const result = analyzeResume(weakResume, '');
const ranked = prioritizeFeedback(result.feedback);

check('weak resume scores low', result.overallScore < 50);
check('every feedback item has a message', result.feedback.every((f) => !!f.message));
check('errors rank before successes', ranked.findIndex((f) => f.type === 'error') < ranked.findIndex((f) => f.type === 'success'));
check('prioritize does not drop items', ranked.length === result.feedback.length);

// The paid tier is defined by detail+solution being present on actionable items.
const actionable = result.feedback.filter((f) => f.type !== 'success');
check('all actionable items carry a detail explanation', actionable.every((f) => !!f.detail));
check('all actionable items carry a solution', actionable.every((f) => !!f.solution));

const strongResume: any = {
    profile: { fullName: 'B', email: 'b@x.com', phone: '123', location: 'London', website: '', linkedin: 'li', summary: 'A detailed professional summary that comfortably exceeds fifty characters in length.' },
    education: [{ id: '1', institution: 'X', degree: 'BSc', fieldOfStudy: 'CS', startDate: '2019', endDate: '2022', current: false }],
    experience: [{ id: '1', company: 'Y', title: 'Dev', location: 'L', startDate: '2022', endDate: '2024', current: false, description: 'Led migration reducing latency by 40% across 3 services, improving throughput for 10k daily users significantly.' }],
    leadership: [], projects: [],
    skills: [{ id: '1', category: 'Lang', skills: ['TS'] }],
};
const strong = analyzeResume(strongResume, '');
check('strong resume scores higher than weak', strong.overallScore > result.overallScore);
check('score stays within 0-100', strong.overallScore >= 0 && strong.overallScore <= 100);

console.log(failures === 0 ? '\nAll tier checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
