/**
 * End-to-end PDF render check. Requires a Chromium browser: puppeteer's
 * bundled Chrome, system Chrome, or Edge. Run with: npm run test:pdf
 */
import fs from 'fs';
import path from 'path';
import { generatePDF } from '../lib/resume-renderer/render';

const OUT_DIR = path.join(__dirname, 'output');

const resume: any = {
    id: 'test', title: 'Test',
    profile: { fullName: 'Ada Lovelace', email: 'ada@example.com', phone: '+44 20 7946 0958', location: 'London, UK', website: '', linkedin: '', summary: 'Analyst with 2 years in data pipelines.' },
    education: [{ id: '1', institution: 'University of London', degree: 'BSc', fieldOfStudy: 'Maths', startDate: '2019', endDate: '2022', current: false }],
    experience: [{ id: '1', company: 'Acme', title: 'Data Analyst', location: 'London', startDate: '2022', endDate: '2024', current: false, description: 'Cut report prep 40% by automating data pulls.' }],
    leadership: [], projects: [],
    skills: [{ id: '1', category: 'Languages', skills: ['SQL', 'Python'] }],
    customStyles: { theme: 'standard', accentColor: '#111827', primaryColor: '#111827', fontHeading: 'Inter', fontBody: 'Inter' },
};

async function main() {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const clean = await generatePDF(resume, { watermark: false });
    const marked = await generatePDF(resume, { watermark: true });

    fs.writeFileSync(path.join(OUT_DIR, 'clean.pdf'), clean);
    fs.writeFileSync(path.join(OUT_DIR, 'watermarked.pdf'), marked);

    let failures = 0;
    const check = (name: string, cond: boolean) => {
        if (!cond) failures++;
        console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
    };

    check('clean render produces a valid PDF', clean.subarray(0, 5).toString() === '%PDF-');
    check('watermarked render produces a valid PDF', marked.subarray(0, 5).toString() === '%PDF-');
    check('output is a real document, not a stub', clean.length > 1000);
    check('watermark adds content', marked.length > clean.length);

    console.log(`\nWrote ${OUT_DIR}`);
    console.log(failures === 0 ? 'All PDF render checks passed.' : `${failures} check(s) failed.`);
    process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
