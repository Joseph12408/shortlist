/**
 * Verifies the watermark overlay is injected into the rendered HTML for every
 * template, and that clean renders are untouched. Runs without Chrome.
 */
import { buildResumeHTML } from '../lib/resume-renderer/render';

const base: any = {
    id: 'test',
    title: 'Test',
    profile: {
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '+44 20 7946 0958',
        location: 'London, UK',
        website: 'https://ada.dev',
        linkedin: 'https://linkedin.com/in/ada',
        summary: 'Analyst with 2 years in data pipelines.',
    },
    education: [{ id: '1', institution: 'University of London', degree: 'BSc', fieldOfStudy: 'Maths', startDate: '2019', endDate: '2022', current: false }],
    experience: [{ id: '1', company: 'Acme', title: 'Data Analyst', location: 'London', startDate: '2022', endDate: '2024', current: false, description: 'Cut report prep 40%.' }],
    leadership: [],
    projects: [],
    skills: [{ id: '1', category: 'Languages', skills: ['SQL', 'Python'] }],
};

const templates = ['standard', 'classic', 'minimal', 'modern', 'efficient', 'sidebar', 'sidebar_right', 'banner'];

let failures = 0;

for (const theme of templates) {
    const resume = { ...base, customStyles: { theme, accentColor: '#111827', primaryColor: '#111827', fontHeading: 'Inter', fontBody: 'Inter' } };

    const clean = buildResumeHTML(resume, { watermark: false });
    const marked = buildResumeHTML(resume, { watermark: true });

    const cleanHasNone = !clean.includes('sl-watermark');
    const markedHasOverlay = marked.includes('id="sl-watermark"');
    const markedHasStyle = marked.includes('#sl-watermark {');
    const markedHasText = marked.includes('Made with Shortlist');
    // The overlay must sit inside the page container to position correctly.
    const insidePageRoot = /<div id="page-root"[^>]*>\s*<div id="sl-watermark">/.test(marked);

    const ok = cleanHasNone && markedHasOverlay && markedHasStyle && markedHasText && insidePageRoot;
    if (!ok) failures++;

    console.log(
        `${ok ? 'PASS' : 'FAIL'}  ${theme.padEnd(14)}` +
        ` clean-clear=${cleanHasNone} overlay=${markedHasOverlay} css=${markedHasStyle}` +
        ` text=${markedHasText} positioned=${insidePageRoot}`
    );
}

console.log(failures === 0 ? '\nAll templates watermark correctly.' : `\n${failures} template(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
