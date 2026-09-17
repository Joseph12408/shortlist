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
check('prioritize does not drop items', ranked.length === result.feedback.length);

// prioritizeFeedback orders worst-first, tested directly so it does not depend
// on a given resume happening to produce all three severities.
const mixed = prioritizeFeedback([
    { category: 'Content', message: 's', type: 'success', scoreImpact: 0 },
    { category: 'Content', message: 'e', type: 'error', scoreImpact: 0 },
    { category: 'Content', message: 'w', type: 'warning', scoreImpact: 0 },
] as any);
check('errors rank before warnings before successes',
    mixed[0].type === 'error' && mixed[1].type === 'warning' && mixed[2].type === 'success');

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

// An excellent resume must be able to reach the top band with NO job description.
// The old grader capped no-JD resumes at 90; this guards against that regressing.
const bullet = (verb: string, n: string) =>
    `${verb} ${n} across four regional teams by rebuilding the reporting pipeline, cutting manual effort and improving accuracy for stakeholders`;
const role = (title: string, v1: string, v2: string, v3: string, v4: string) => ({
    id: title, company: 'Acme', title, location: 'London', startDate: '2021', endDate: '2023', current: false,
    description: [bullet(v1, 'revenue 32%'), bullet(v2, 'churn 18%'), bullet(v3, 'latency 40%'), bullet(v4, 'costs $250k')].join('\n'),
});
const excellentResume: any = {
    profile: {
        fullName: 'Jane Mwangi', email: 'jane@example.com', phone: '+254700000000', location: 'Nairobi, Kenya',
        website: 'jane.dev', linkedin: 'in/jane',
        summary: 'Product analyst with four years turning messy operational data into decisions. Strong in SQL, Python and experimentation, targeting a senior product analytics role at a growth-stage company.',
    },
    education: [{ id: '1', institution: 'University of Nairobi', degree: 'BSc', fieldOfStudy: 'Statistics', startDate: '2016', endDate: '2020', current: false }],
    experience: [
        role('Senior Data Analyst', 'Led', 'Reduced', 'Cut', 'Saved'),
        role('Data Analyst', 'Built', 'Automated', 'Streamlined', 'Drove'),
    ],
    leadership: [], projects: [],
    skills: [
        { id: '1', category: 'Languages', skills: ['SQL', 'Python', 'R', 'TypeScript'] },
        { id: '2', category: 'Tools', skills: ['dbt', 'Airflow', 'Tableau', 'Looker'] },
        { id: '3', category: 'Platforms', skills: ['BigQuery', 'Snowflake', 'AWS', 'GCP'] },
    ],
};
const excellent = analyzeResume(excellentResume, '');
check('an excellent resume can exceed 90 without a job description', excellent.overallScore > 90);

console.log(failures === 0 ? '\nAll tier checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
