/**
 * Calls the real Gemini API with the production system prompt and checks that
 * the response actually contains rewritten content in the expected shape.
 */
import fs from 'fs';
import path from 'path';
import { generateContentWithFallback } from '../lib/gemini';

const apiKey = process.env.GEMINI_API_KEY!;
if (!apiKey) {
    console.error('GEMINI_API_KEY missing from env');
    process.exit(1);
}

// Deliberately weak resume: passive voice, no metrics, buzzwords.
const resume = {
    id: 'test',
    title: 'Test',
    profile: {
        fullName: 'Jane Mwangi',
        email: 'jane@example.com',
        phone: '+254 700 000 000',
        location: 'Nairobi, Kenya',
        website: '',
        linkedin: 'linkedin.com/in/janemwangi',
        summary: 'I am a hardworking and passionate team player seeking a challenging role that allows me to grow.',
    },
    education: [{
        id: 'e1', institution: 'University of Nairobi', degree: 'BSc', fieldOfStudy: 'Computer Science',
        startDate: '2019', endDate: '2023', current: false, score: '',
    }],
    experience: [{
        id: 'x1', company: 'Acme Ltd', title: 'Junior Data Analyst', location: 'Nairobi',
        startDate: '2023', endDate: 'Present', current: true,
        description: 'Responsible for making reports. Helped with the data. Worked on dashboards using Excel and SQL.',
    }],
    leadership: [],
    projects: [],
    skills: [{ id: 's1', category: 'Technical', skills: ['SQL', 'Excel', 'Python'] }],
    customStyles: {
        theme: 'standard', accentColor: '#111827', primaryColor: '#111827',
        fontHeading: 'Merriweather', fontBody: 'Source Sans 3',
    },
};

const jobDescription = `We are hiring a Data Analyst. Requirements: strong SQL,
experience building dashboards in Power BI, Python for data cleaning, and the
ability to communicate findings to non-technical stakeholders. Experience with
A/B testing is a plus.`;

async function main() {
    const systemInstructions = fs.readFileSync(
        path.join(process.cwd(), 'ai', 'system_design_prompt.txt'), 'utf-8'
    );

    const prompt = `${systemInstructions}

====================
CONTEXT & INPUT
====================

USER STYLE GOAL: "General Professional"

TARGET JOB DESCRIPTION:
${jobDescription}

INPUT RESUME DATA:
${JSON.stringify(resume, null, 2)}

INSTRUCTION OVERRIDE:
The "INPUT RESUME DATA" is the **single source of truth**.
- If it contains data, **PRESERVE IT**. Do not add extra schools or jobs.
- If it is empty, generate a sample.
- **NEVER use "University of Applied Sciences".**
- Return ONLY valid JSON adhering to the schema defined above.
- "refined_content" is REQUIRED. Returning style tokens without rewritten
  content is a failed response.`;

    const data = await generateContentWithFallback(prompt, apiKey, {
        temperature: 0.35,
        maxOutputTokens: 8192,
    });

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let out: any;
    try {
        out = JSON.parse(text);
    } catch {
        console.log('FAIL: response was not valid JSON');
        console.log(text.slice(0, 800));
        process.exit(1);
    }

    const r = out.refined_content;
    let failures = 0;
    const check = (name: string, cond: boolean) => {
        if (!cond) failures++;
        console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
    };

    check('refined_content present', !!r);
    check('summary rewritten (not the original)', r?.profile?.summary && r.profile.summary !== resume.profile.summary);
    check('summary drops first person', !/\bI am\b|\bmy\b/i.test(r?.profile?.summary || ''));
    check('summary drops "challenging role" cliche', !/challenging role/i.test(r?.profile?.summary || ''));
    check('experience array returned, same length', Array.isArray(r?.experience) && r.experience.length === resume.experience.length);
    check('experience description rewritten', r?.experience?.[0]?.description && r.experience[0].description !== resume.experience[0].description);
    check('no "Responsible for"', !/responsible for/i.test(r?.experience?.[0]?.description || ''));
    check('no "Helped with"', !/helped with/i.test(r?.experience?.[0]?.description || ''));
    check('company name preserved', r?.experience?.[0]?.company === 'Acme Ltd');
    check('job title preserved', r?.experience?.[0]?.title === 'Junior Data Analyst');
    check('education preserved, not duplicated', Array.isArray(r?.education) && r.education.length === 1);
    check('institution unchanged', r?.education?.[0]?.institution === 'University of Nairobi');
    check('skills returned', Array.isArray(r?.skills) && r.skills.length > 0);
    check('theme NOT switched away from standard', (out.style_tokens?.theme ?? 'standard') === 'standard');
    check('changes_made reported', Array.isArray(out.changes_made) && out.changes_made.length > 0);

    // Truthfulness: Power BI and A/B testing are in the JD but NOT in the resume.
    const allText = JSON.stringify(r).toLowerCase();
    check('did NOT fabricate Power BI', !allText.includes('power bi'));
    check('did NOT fabricate A/B testing', !allText.includes('a/b test'));

    console.log('\n--- REWRITTEN SUMMARY ---');
    console.log(r?.profile?.summary);
    console.log('\n--- REWRITTEN EXPERIENCE ---');
    console.log(r?.experience?.[0]?.description);
    console.log('\n--- CHANGES REPORTED ---');
    console.log((out.changes_made || []).map((c: string) => ' - ' + c).join('\n'));

    console.log(failures === 0 ? '\nAll optimization checks passed.' : `\n${failures} check(s) failed.`);
    process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
