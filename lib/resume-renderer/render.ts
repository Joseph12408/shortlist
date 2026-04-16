import { Resume } from '@/types/resume';

export async function generatePDF(resumeData: Resume): Promise<Buffer> {
    let browser = null;

    try {
        let puppeteer = (await import('puppeteer')) as any;
        if (puppeteer.default) puppeteer = puppeteer.default;

        const html = buildResumeHTML(resumeData);
        if (!html) {
            console.error("❌ PDF Generation: HTML build returned empty.");
            throw new Error("HTML content is empty");
        }
        console.log("📄 Generated HTML length:", html.length);

        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--font-render-hinting=none',
            ],
            timeout: 30000,
        });

        const page = await browser.newPage();
        await page.setContent(html, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });

        // Wait for Google Fonts to finish loading
        await page.evaluateHandle('document.fonts.ready');

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
        });

        return Buffer.from(pdfBuffer);
    } catch (error: any) {
        console.error('❌ PDF Generation Failed:', error.message);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}

/* ================================================================
   HTML builders that mirror the React template components.

   Each builder uses the EXACT SAME Tailwind class names as its
   React counterpart so the Tailwind CDN produces identical output.
   ================================================================ */

function esc(s: string | undefined | null): string {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fontImports(resume: Resume): string {
    const h = resume.customStyles?.fontHeading || 'Inter';
    const b = resume.customStyles?.fontBody || 'Inter';
    const families = [...new Set([h, b])].map(f => f.replace(/ /g, '+')).map(f => `family=${f}:wght@400;700`).join('&');
    return `<link href="https://fonts.googleapis.com/css2?${families}&display=swap" rel="stylesheet">`;
}

function wrap(body: string, resume: Resume, bodyStyle?: string): string {
    const fh = resume.customStyles?.fontHeading || 'Inter';
    const fb = resume.customStyles?.fontBody || 'Inter';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
${fontImports(resume)}
<style>
/* Reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: '${fb}', sans-serif; }
@page { size: A4; margin: 0; }
ul { list-style: disc; padding-left: 18px; }
a { color: inherit; text-decoration: none; }

/* Layout */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-1 { flex: 1 1 0%; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.items-baseline { align-items: baseline; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }

/* Sizing */
.h-full { height: 100%; }
.min-h-full { min-height: 100%; }
.h-px { height: 1px; }
.h-2 { height: 0.5rem; }
.h-6 { height: 1.5rem; }
.w-2 { width: 0.5rem; }
.w-6 { width: 1.5rem; }
.w-32 { width: 8rem; }
.w-\\[30\\%\\] { width: 30%; }
.w-\\[32\\%\\] { width: 32%; }
.w-\\[35\\%\\] { width: 35%; }
.min-w-\\[100px\\] { min-width: 100px; }
.max-w-lg { max-width: 32rem; }
.max-w-2xl { max-width: 42rem; }
.shrink-0 { flex-shrink: 0; }

/* Spacing */
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }
.gap-12 { gap: 3rem; }
.space-y-1 > * + * { margin-top: 0.25rem; }
.space-y-2 > * + * { margin-top: 0.5rem; }
.space-y-3 > * + * { margin-top: 0.75rem; }
.space-y-4 > * + * { margin-top: 1rem; }
.space-y-5 > * + * { margin-top: 1.25rem; }
.space-y-6 > * + * { margin-top: 1.5rem; }
.space-y-8 > * + * { margin-top: 2rem; }
.space-y-10 > * + * { margin-top: 2.5rem; }

/* Padding */
.p-1\\.5 { padding: 0.375rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.p-10 { padding: 2.5rem; }
.p-12 { padding: 3rem; }
.p-16 { padding: 4rem; }
.px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
.px-1\\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.pt-12 { padding-top: 3rem; }
.pt-14 { padding-top: 3.5rem; }
.pb-1 { padding-bottom: 0.25rem; }
.pb-2 { padding-bottom: 0.5rem; }
.pb-6 { padding-bottom: 1.5rem; }
.pl-1 { padding-left: 0.25rem; }
.pl-4 { padding-left: 1rem; }
.pl-6 { padding-left: 1.5rem; }

/* Margin */
.mx-auto { margin-left: auto; margin-right: auto; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-10 { margin-bottom: 2.5rem; }
.mb-12 { margin-bottom: 3rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.ml-4 { margin-left: 1rem; }

/* Typography */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-\\[10px\\] { font-size: 10px; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-5xl { font-size: 3rem; line-height: 1; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-black { font-weight: 900; }
.font-normal { font-weight: 400; }
.font-light { font-weight: 300; }
.italic { font-style: italic; }
.uppercase { text-transform: uppercase; }
.tracking-tight { letter-spacing: -0.025em; }
.tracking-tighter { letter-spacing: -0.05em; }
.tracking-wide { letter-spacing: 0.025em; }
.tracking-wider { letter-spacing: 0.05em; }
.tracking-widest { letter-spacing: 0.1em; }
.tracking-\\[0\\.2em\\] { letter-spacing: 0.2em; }
.leading-none { line-height: 1; }
.leading-tight { line-height: 1.25; }
.leading-relaxed { line-height: 1.625; }
.leading-7 { line-height: 1.75rem; }
.text-center { text-align: center; }
.whitespace-pre-wrap { white-space: pre-wrap; }
.whitespace-pre-line { white-space: pre-line; }
.whitespace-nowrap { white-space: nowrap; }
.break-all { word-break: break-all; }
.underline { text-decoration: underline; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.list-disc { list-style-type: disc; }
.list-outside { list-style-position: outside; }

/* Colors */
.text-white { color: #ffffff; }
.text-black { color: #000000; }
.text-white\\/50 { color: rgba(255,255,255,0.5); }
.text-white\\/60 { color: rgba(255,255,255,0.6); }
.text-white\\/80 { color: rgba(255,255,255,0.8); }
.text-white\\/90 { color: rgba(255,255,255,0.9); }
.text-slate-300 { color: #cbd5e1; }
.text-slate-400 { color: #94a3b8; }
.text-slate-500 { color: #64748b; }
.text-slate-600 { color: #475569; }
.text-slate-700 { color: #334155; }
.text-slate-800 { color: #1e293b; }
.text-slate-900 { color: #0f172a; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-800 { color: #1f2937; }
.text-blue-800 { color: #1e40af; }
.bg-white { background-color: #ffffff; }
.bg-white\\/10 { background-color: rgba(255,255,255,0.1); }
.bg-slate-50 { background-color: #f8fafc; }
.bg-slate-100 { background-color: #f1f5f9; }
.bg-slate-200 { background-color: #e2e8f0; }
.bg-\\[\\#F0F4F8\\] { background-color: #F0F4F8; }

/* Borders */
.border { border-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-b-2 { border-bottom-width: 2px; }
.border-l-2 { border-left-width: 2px; }
.border-r { border-right-width: 1px; }
.border-t { border-top-width: 1px; }
.border-black { border-color: #000000; }
.border-slate-200 { border-color: #e2e8f0; }
.border-white\\/5 { border-color: rgba(255,255,255,0.05); }
.border-white\\/20 { border-color: rgba(255,255,255,0.2); }
.border-white\\/30 { border-color: rgba(255,255,255,0.3); }

/* Effects */
.rounded { border-radius: 0.25rem; }
.rounded-full { border-radius: 9999px; }
.ring-4 { box-shadow: 0 0 0 4px var(--tw-ring-color, rgba(255,255,255,1)); }
.ring-white { --tw-ring-color: #ffffff; }
.opacity-75 { opacity: 0.75; }
.opacity-80 { opacity: 0.8; }
.opacity-90 { opacity: 0.9; }
.overflow-hidden { overflow: hidden; }

/* Positioning */
.relative { position: relative; }
.absolute { position: absolute; }
.-left-\\[5px\\] { left: -5px; }
.top-2 { top: 0.5rem; }
.inline-block { display: inline-block; }
</style>
</head><body>
<div style="width:210mm;height:297mm;background:white;overflow:hidden;${bodyStyle || ''}">
${body}
</div></body></html>`;
}

function buildResumeHTML(resume: Resume): string {
    const theme = resume.customStyles?.theme || 'modern';
    switch (theme) {
        case 'classic':        return buildClassicHTML(resume);
        case 'minimal':        return buildMinimalHTML(resume);
        case 'efficient':      return buildEfficientHTML(resume);
        case 'sidebar':        return buildSidebarHTML(resume, false);
        case 'sidebar_right':  return buildSidebarHTML(resume, true);
        case 'banner':         return buildBannerHTML(resume);
        case 'standard':       return buildStandardHTML(resume);
        default:               return buildModernHTML(resume);
    }
}

// ─── MODERN ───────────────────────────────────────────────────────
function buildModernHTML(r: Resume): string {
    const p = r.profile || {} as any;
    const pc = r.customStyles?.primaryColor || '#111827';
    const ac = r.customStyles?.accentColor || '#3B82F6';
    const fh = r.customStyles?.fontHeading || 'Inter';
    const fb = r.customStyles?.fontBody || 'Open Sans';

    const sidebar = `
    <aside class="w-[32%] text-white p-8 flex flex-col gap-8" style="background-color:${pc}">
        <div class="mt-4 space-y-4">
            ${p.email ? `<div class="flex flex-col"><span class="text-[10px] text-white/50 uppercase tracking-widest mb-1 font-bold">Email</span><span class="text-sm font-medium opacity-90">${esc(p.email)}</span></div>` : ''}
            ${p.phone ? `<div class="flex flex-col"><span class="text-[10px] text-white/50 uppercase tracking-widest mb-1 font-bold">Phone</span><span class="text-sm font-medium opacity-90">${esc(p.phone)}</span></div>` : ''}
            ${p.location ? `<div class="flex flex-col"><span class="text-[10px] text-white/50 uppercase tracking-widest mb-1 font-bold">Location</span><span class="text-sm font-medium opacity-90">${esc(p.location)}</span></div>` : ''}
            ${p.website ? `<div class="flex flex-col"><span class="text-[10px] text-white/50 uppercase tracking-widest mb-1 font-bold">Website</span><span class="text-sm font-medium opacity-90 break-all">${esc(p.website.replace(/^https?:\/\//, ''))}</span></div>` : ''}
        </div>
        ${(r.education||[]).length > 0 ? `
        <div>
            <h2 class="text-sm font-bold uppercase tracking-widest text-white/50 border-b border-white/20 pb-2 mb-4">Education</h2>
            <div class="space-y-6">
                ${(r.education||[]).map(edu => `<div>
                    <div class="text-sm font-bold leading-tight mb-1" style="color:${ac}">${esc(edu.institution)}</div>
                    <div class="text-xs text-white/80">${esc(edu.degree)}</div>
                    <div class="text-[10px] text-white/50 mt-1 uppercase tracking-wide">${esc(edu.startDate)} – ${esc(edu.endDate)}</div>
                </div>`).join('')}
            </div>
        </div>` : ''}
        ${(r.skills||[]).length > 0 ? `
        <div>
            <h2 class="text-sm font-bold uppercase tracking-widest text-white/50 border-b border-white/20 pb-2 mb-4">Skills</h2>
            <div class="space-y-4">
                ${(r.skills||[]).map(sg => `<div>
                    <div class="text-[10px] font-bold text-white/60 mb-2 uppercase tracking-wider">${esc(sg.category)}</div>
                    <div class="flex flex-wrap gap-2">
                        ${(sg.skills||[]).map(s => `<span class="text-xs px-2 py-1 rounded bg-white/10 text-white/90 border border-white/5">${esc(s)}</span>`).join('')}
                    </div>
                </div>`).join('')}
            </div>
        </div>` : ''}
    </aside>`;

    const main = `
    <main class="flex-1 p-10 pt-14">
        <header class="mb-10">
            <h1 class="text-5xl uppercase tracking-tighter leading-none mb-3 font-bold" style="color:${pc};font-family:'${fh}',sans-serif">${esc(p.fullName)}</h1>
            <p class="text-xl tracking-wide font-medium" style="color:${ac}">${esc((r.experience||[])[0]?.title || 'Professional Role')}</p>
        </header>
        ${p.summary ? `<section class="mb-10 max-w-2xl"><p class="text-sm leading-7 text-slate-600">${esc(p.summary)}</p></section>` : ''}
        ${(r.experience||[]).length > 0 ? `
        <section>
            <div class="flex items-center gap-4 mb-8">
                <h2 class="text-sm uppercase tracking-widest text-slate-400 font-bold">Experience</h2>
                <div class="flex-1 h-px bg-slate-200"></div>
            </div>
            <div class="space-y-10">
                ${(r.experience||[]).map(exp => `
                <div class="relative pl-6 border-l-2" style="border-color:${ac}">
                    <div class="absolute -left-[5px] top-2 h-2 w-2 rounded-full ring-4 ring-white" style="background-color:${ac}"></div>
                    <div class="flex justify-between items-baseline mb-2">
                        <h3 class="text-xl text-slate-900 font-bold">${esc(exp.title)}</h3>
                        <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">${esc(exp.startDate)} – ${exp.current ? 'Present' : esc(exp.endDate)}</span>
                    </div>
                    <div class="text-sm mb-3 font-medium uppercase tracking-wide opacity-80" style="color:${pc}">${esc(exp.company)}${exp.location ? ` — ${esc(exp.location)}` : ''}</div>
                    ${exp.description ? `<div class="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">${esc(exp.description)}</div>` : ''}
                </div>`).join('')}
            </div>
        </section>` : ''}
    </main>`;

    return wrap(`<div class="h-full flex flex-row text-slate-800" style="font-family:'${fb}',sans-serif">${sidebar}${main}</div>`, r);
}

// ─── CLASSIC ──────────────────────────────────────────────────────
function buildClassicHTML(r: Resume): string {
    const p = r.profile || {} as any;
    const ac = r.customStyles?.accentColor || '#111827';
    const fh = r.customStyles?.fontHeading || 'Merriweather';
    const fb = r.customStyles?.fontBody || 'Source Sans 3';
    const contact = [p.email, p.phone, p.location, p.linkedin?.replace(/^https?:\/\//, ''), p.website?.replace(/^https?:\/\//, '')].filter(Boolean).map(s => esc(s)).join(' · ');

    const sectionHead = (title: string) => `<h2 class="text-sm uppercase tracking-wider mb-3 border-b pb-1 font-bold" style="color:${ac};border-color:${ac}">${title}</h2>`;

    const body = `
    <div class="p-12 h-full flex flex-col text-slate-900" style="font-family:'${fb}',serif">
        <header class="border-b-2 pb-6 mb-6" style="border-color:${ac}">
            <h1 class="text-4xl uppercase tracking-tight mb-2 font-bold" style="color:${ac};font-family:'${fh}',serif">${esc(p.fullName)}</h1>
            <div class="flex flex-wrap gap-4 text-sm text-slate-600 font-medium">${contact}</div>
        </header>
        ${p.summary ? `<section class="mb-6">${sectionHead('Professional Summary')}<p class="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">${esc(p.summary)}</p></section>` : ''}
        ${(r.experience||[]).length > 0 ? `<section class="mb-6">${sectionHead('Experience')}<div class="space-y-4">${(r.experience||[]).map(exp => `
            <div>
                <div class="flex justify-between items-baseline mb-1"><h3 class="text-slate-800 text-lg font-bold">${esc(exp.title)}</h3><span class="text-sm text-slate-600 font-medium">${esc(exp.startDate)} – ${exp.current?'Present':esc(exp.endDate)}</span></div>
                <div class="text-sm font-semibold mb-2" style="color:${ac}">${esc(exp.company)}${exp.location?`, ${esc(exp.location)}`:''}</div>
                ${exp.description?`<div class="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">${esc(exp.description)}</div>`:''}
            </div>`).join('')}</div></section>` : ''}
        ${(r.leadership||[]).length > 0 ? `<section class="mb-6">${sectionHead('Leadership Experience')}<div class="space-y-4">${(r.leadership||[]).map(l => `
            <div><div class="flex justify-between items-baseline mb-1"><h3 class="text-slate-800 text-lg font-bold">${esc(l.title)}</h3><span class="text-sm text-slate-600 font-medium">${esc(l.startDate)} – ${esc(l.endDate)}</span></div>
            <div class="text-sm font-semibold mb-2" style="color:${ac}">${esc(l.company)}</div>
            ${l.description?`<div class="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">${esc(l.description)}</div>`:''}</div>`).join('')}</div></section>` : ''}
        ${(r.education||[]).length > 0 ? `<section class="mb-6">${sectionHead('Education')}<div class="space-y-3">${(r.education||[]).map(edu => `
            <div><div class="flex justify-between items-baseline mb-1"><h3 class="text-slate-800 font-bold">${esc(edu.institution)}</h3><span class="text-sm text-slate-600 font-medium">${esc(edu.startDate)} – ${esc(edu.endDate)}</span></div>
            <div class="text-sm text-slate-800"><span class="font-semibold">${esc(edu.degree)}</span>${edu.fieldOfStudy?` in ${esc(edu.fieldOfStudy)}`:''}</div></div>`).join('')}</div></section>` : ''}
        ${(r.skills||[]).length > 0 ? `<section>${sectionHead('Skills')}<div class="space-y-2">${(r.skills||[]).map(sg => `
            <div class="flex gap-2"><span class="text-slate-800 w-32 shrink-0 text-sm font-bold">${esc(sg.category)}</span><div class="text-sm text-slate-700 flex-1">${(sg.skills||[]).map(s=>esc(s)).join(', ')}</div></div>`).join('')}</div></section>` : ''}
        ${(r.projects||[]).length > 0 ? `<section class="mb-6">${sectionHead('Projects')}<div class="space-y-3">${(r.projects||[]).map(proj => `
            <div><h3 class="font-bold text-base">${esc(proj.name)}</h3><div class="text-sm text-slate-600">${esc(proj.description)}</div></div>`).join('')}</div></section>` : ''}
    </div>`;
    return wrap(body, r);
}

// ─── STANDARD ─────────────────────────────────────────────────────
function buildStandardHTML(r: Resume): string {
    const p = r.profile || {} as any;
    const pc = r.customStyles?.primaryColor || '#000000';
    const fb = r.customStyles?.fontBody || 'Source Sans 3';
    const fh = r.customStyles?.fontHeading || 'Merriweather';

    const contactParts = [p.phone, p.email, p.linkedin ? 'LinkedIn' : '', p.location].filter(Boolean);
    const contactHTML = contactParts.map(c => `<span>${esc(c)}</span>`).join('<span>|</span>');

    const sHead = (t: string) => `<h2 class="text-sm font-bold uppercase border-b border-black mb-3 tracking-wider" style="border-color:${pc};color:${pc}">${t}</h2>`;

    const body = `
    <div class="p-12 h-full flex flex-col text-black" style="font-family:'${fb}',sans-serif">
        <header class="text-center mb-6">
            <h1 class="text-3xl font-bold uppercase tracking-wide mb-2" style="color:${pc};font-family:'${fh}',serif">${esc(p.fullName)}</h1>
            <div class="flex justify-center flex-wrap gap-3 text-sm text-gray-800">${contactHTML}</div>
        </header>
        <div class="space-y-5">
            ${p.summary ? `<section>${sHead('Summary')}<p class="text-sm leading-relaxed">${esc(p.summary)}</p></section>` : ''}
            ${(r.experience||[]).length > 0 ? `<section>${sHead('Experience')}<div class="space-y-4">${(r.experience||[]).map(exp => `
                <div>
                    <div class="flex justify-between items-baseline"><h3 class="font-bold text-base">${esc(exp.title)}</h3><span class="text-sm italic text-gray-700">${esc(exp.startDate)} – ${exp.current?'Present':esc(exp.endDate)}</span></div>
                    <div class="flex justify-between items-baseline mb-1"><span class="text-sm font-semibold italic">${esc(exp.company)}</span><span class="text-sm text-gray-600">${esc(exp.location)}</span></div>
                    <div class="text-sm leading-relaxed mt-1 whitespace-pre-line pl-1">${esc(exp.description)}</div>
                </div>`).join('')}</div></section>` : ''}
            ${(r.leadership||[]).length > 0 ? `<section>${sHead('Leadership Experience')}<div class="space-y-4">${(r.leadership||[]).map(l => `
                <div>
                    <div class="flex justify-between items-baseline"><h3 class="font-bold text-base">${esc(l.title)}</h3><span class="text-sm italic text-gray-700">${esc(l.startDate)} – ${esc(l.endDate)}</span></div>
                    <div class="flex justify-between items-baseline mb-1"><span class="text-sm font-semibold italic">${esc(l.company)}</span><span class="text-sm text-gray-600">${esc(l.location)}</span></div>
                    <div class="text-sm leading-relaxed mt-1 whitespace-pre-line pl-1">${esc(l.description)}</div>
                </div>`).join('')}</div></section>` : ''}
            ${(r.projects||[]).length > 0 ? `<section>${sHead('Projects')}<div class="space-y-3">${(r.projects||[]).map(proj => `
                <div><div class="flex justify-between items-baseline"><h3 class="font-bold text-base">${esc(proj.name)}</h3>${proj.url?`<a href="${esc(proj.url)}" class="text-xs text-blue-800">View Project</a>`:''}</div>
                <div class="text-sm leading-relaxed mt-1">${esc(proj.description)}</div>
                ${(proj.technologies||[]).length>0?`<div class="text-xs text-gray-600 mt-1 italic"><span class="font-semibold">Technologies:</span> ${(proj.technologies||[]).map(t=>esc(t)).join(', ')}</div>`:''}</div>`).join('')}</div></section>` : ''}
            ${(r.education||[]).length > 0 ? `<section>${sHead('Education')}<div class="space-y-3">${(r.education||[]).map(edu => `
                <div><div class="flex justify-between items-baseline"><h3 class="font-bold text-base">${esc(edu.institution)}</h3><span class="text-sm italic text-gray-700">${esc(edu.startDate)} – ${esc(edu.endDate)}</span></div>
                <div class="text-sm">${esc(edu.degree)} ${edu.fieldOfStudy?`in ${esc(edu.fieldOfStudy)}`:''}</div></div>`).join('')}</div></section>` : ''}
            ${(r.skills||[]).length > 0 ? `<section>${sHead('Technical Skills')}<div class="space-y-1">${(r.skills||[]).map(sg => `
                <div class="text-sm flex gap-2"><span class="font-bold min-w-[100px]">${esc(sg.category)}:</span><span>${(sg.skills||[]).map(s=>esc(s)).join(', ')}</span></div>`).join('')}</div></section>` : ''}
        </div>
    </div>`;
    return wrap(body, r);
}

// ─── MINIMAL ──────────────────────────────────────────────────────
function buildMinimalHTML(r: Resume): string {
    const p = r.profile || {} as any;
    const ac = r.customStyles?.accentColor || '#000000';
    const pc = r.customStyles?.primaryColor || '#ffffff';
    const fh = r.customStyles?.fontHeading || 'sans';
    const fb = r.customStyles?.fontBody || 'sans';

    const body = `
    <div class="p-16 h-full flex flex-col text-slate-900" style="background-color:${pc};font-family:'${fb}',sans-serif">
        <header class="mb-12 text-center">
            <h1 class="text-3xl tracking-widest uppercase mb-4 text-slate-900 font-bold" style="color:${ac};font-family:'${fh}',sans-serif">${esc(p.fullName)}</h1>
            <div class="flex flex-wrap justify-center gap-6 text-xs text-slate-500 uppercase tracking-widest">
                ${p.email?`<span>${esc(p.email)}</span>`:''}${p.phone?`<span>${esc(p.phone)}</span>`:''}${p.location?`<span>${esc(p.location)}</span>`:''}${p.linkedin?`<span>LinkedIn</span>`:''}
            </div>
        </header>
        ${p.summary?`<section class="mb-10 text-center max-w-lg mx-auto"><p class="text-sm leading-7 text-slate-600">${esc(p.summary)}</p></section>`:''}
        ${(r.experience||[]).length>0?`<section class="mb-10">
            <h2 class="text-xs uppercase tracking-[0.2em] text-center mb-8 font-bold" style="color:${ac}">Experience</h2>
            <div class="space-y-8">${(r.experience||[]).map(exp=>`
                <div>
                    <div class="flex justify-between items-baseline mb-2"><h3 class="text-slate-800 font-bold">${esc(exp.company)}</h3><span class="text-xs text-slate-400 font-medium">${esc(exp.startDate)} – ${exp.current?'Present':esc(exp.endDate)}</span></div>
                    <div class="text-sm italic mb-2" style="color:${ac}">${esc(exp.title)}</div>
                    ${exp.description?`<div class="text-sm leading-relaxed text-slate-500 whitespace-pre-wrap">${esc(exp.description)}</div>`:''}
                </div>`).join('')}</div></section>`:''}
        <div class="grid grid-cols-2 gap-12">
            ${(r.education||[]).length>0?`<section>
                <h2 class="text-xs uppercase tracking-[0.2em] mb-6 text-center font-bold" style="color:${ac}">Education</h2>
                <div class="space-y-6 text-center">${(r.education||[]).map(edu=>`
                    <div><div class="text-sm text-slate-800 font-bold">${esc(edu.institution)}</div><div class="text-xs text-slate-500 mt-1">${esc(edu.degree)}</div><div class="text-xs text-slate-400 mt-1">${esc(edu.startDate)} – ${esc(edu.endDate)}</div></div>`).join('')}</div></section>`:''}
            ${(r.skills||[]).length>0?`<section>
                <h2 class="text-xs uppercase tracking-[0.2em] mb-6 text-center font-bold" style="color:${ac}">Skills</h2>
                <div class="space-y-4 text-center">${(r.skills||[]).map(sg=>`
                    <div><div class="text-xs font-bold text-slate-700 mb-1">${esc(sg.category)}</div><div class="text-xs text-slate-500 italic">${(sg.skills||[]).map(s=>esc(s)).join(', ')}</div></div>`).join('')}</div></section>`:''}
        </div>
    </div>`;
    return wrap(body, r);
}

// ─── EFFICIENT ────────────────────────────────────────────────────
function buildEfficientHTML(r: Resume): string {
    const p = r.profile || {} as any;
    const nc = r.customStyles?.accentColor || '#3B82F6';
    const fh = r.customStyles?.fontHeading || 'Inter';
    const fb = r.customStyles?.fontBody || 'Open Sans';

    const contactItem = (label: string, value: string) => value ? `
        <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold" style="background-color:${nc}">${label[0]}</div>
            <span class="break-all">${esc(value)}</span>
        </div>` : '';

    const effHead = (t: string) => `<h3 class="text-lg uppercase tracking-widest font-bold mb-6 inline-block px-1" style="background-color:${nc};color:white;border-color:${nc}">${t}</h3>`;

    const sidebar = `
    <aside class="w-[35%] bg-[#F0F4F8] flex flex-col p-8 gap-8 border-r border-slate-200">
        <div>
            <h3 class="text-lg uppercase tracking-widest font-bold mb-4 border-b-2" style="border-color:${nc};color:${nc}">Contact</h3>
            <div class="space-y-3 text-sm">
                ${contactItem('Phone', p.phone)}${contactItem('Email', p.email)}${contactItem('Location', p.location)}
                ${contactItem('Web', p.website?.replace(/^https?:\/\//, ''))}${contactItem('LinkedIn', p.linkedin?.replace(/^https?:\/\//, ''))}
            </div>
        </div>
        ${(r.skills||[]).length>0?`<div>
            <h3 class="text-lg uppercase tracking-widest font-bold mb-4 border-b-2" style="border-color:${nc};color:${nc}">Skills</h3>
            <div class="space-y-4">${(r.skills||[]).map(sg=>`<div><h4 class="font-semibold text-sm mb-2">${esc(sg.category)}</h4>
                <ul class="list-disc list-outside ml-4 space-y-1 text-sm text-slate-700">${(sg.skills||[]).map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div>`).join('')}</div>
        </div>`:''}
    </aside>`;

    const main = `
    <main class="flex-1 p-8 pt-12 flex flex-col gap-8">
        <header>
            <h1 class="text-4xl uppercase font-bold tracking-tight mb-2" style="color:${nc};font-family:'${fh}',sans-serif">${esc(p.fullName)}</h1>
            <p class="text-lg text-slate-500 font-medium uppercase tracking-wide">${esc((r.experience||[])[0]?.title || 'Professional Title')}</p>
        </header>
        ${p.summary?`<section>${effHead('Summary')}<p class="text-sm leading-relaxed text-slate-700">${esc(p.summary)}</p></section>`:''}
        ${(r.experience||[]).length>0?`<section>${effHead('Work Experience')}<div class="space-y-6">${(r.experience||[]).map(exp=>`
            <div><div class="flex justify-between items-baseline mb-1"><h4 class="text-base font-bold text-slate-900">${esc(exp.title)}</h4><span class="text-xs font-semibold text-slate-500 whitespace-nowrap">${esc(exp.startDate)} – ${exp.current?'Present':esc(exp.endDate)}</span></div>
            <div class="text-sm font-medium mb-2 italic" style="color:${nc}">${esc(exp.company)}, ${esc(exp.location)}</div>
            <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">${esc(exp.description)}</p></div>`).join('')}</div></section>`:''}
        ${(r.leadership||[]).length>0?`<section>${effHead('Leadership Experience')}<div class="space-y-6">${(r.leadership||[]).map(l=>`
            <div><div class="flex justify-between items-baseline mb-1"><h4 class="text-base font-bold text-slate-900">${esc(l.title)}</h4><span class="text-xs font-semibold text-slate-500 whitespace-nowrap">${esc(l.startDate)} – ${esc(l.endDate)}</span></div>
            <div class="text-sm font-medium mb-2 italic" style="color:${nc}">${esc(l.company)}, ${esc(l.location)}</div>
            <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">${esc(l.description)}</p></div>`).join('')}</div></section>`:''}
        ${(r.projects||[]).length>0?`<section>${effHead('Projects')}<div class="space-y-6">${(r.projects||[]).map(proj=>`
            <div><div class="flex justify-between items-baseline mb-1"><h4 class="text-base font-bold text-slate-900">${esc(proj.name)}</h4>${proj.url?`<a href="${esc(proj.url)}" class="text-xs underline" style="color:${nc}">View Project</a>`:''}</div>
            <p class="text-sm text-slate-700 leading-relaxed">${esc(proj.description)}</p>
            ${(proj.technologies||[]).length>0?`<div class="mt-2 flex flex-wrap gap-1">${(proj.technologies||[]).map(t=>`<span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">${esc(t)}</span>`).join('')}</div>`:''}</div>`).join('')}</div></section>`:''}
        ${(r.education||[]).length>0?`<section>${effHead('Education')}<div class="space-y-4">${(r.education||[]).map(edu=>`
            <div><h4 class="text-base font-bold text-slate-900">${esc(edu.institution)}</h4>
            <div class="text-sm font-medium" style="color:${nc}">${esc(edu.degree)} ${edu.fieldOfStudy?`in ${esc(edu.fieldOfStudy)}`:''}</div>
            <div class="text-xs text-slate-500 mt-1">${esc(edu.startDate)} – ${esc(edu.endDate)} ${edu.score?`| GPA: ${esc(edu.score)}`:''}</div></div>`).join('')}</div></section>`:''}
    </main>`;

    return wrap(`<div class="h-full flex flex-row text-slate-800" style="font-family:'${fb}',sans-serif">${sidebar}${main}</div>`, r);
}

// ─── SIDEBAR ──────────────────────────────────────────────────────
function buildSidebarHTML(r: Resume, rightSide: boolean): string {
    const p = r.profile || {} as any;
    const sb = r.customStyles?.accentColor || '#3B82F6';
    const fh = r.customStyles?.fontHeading || 'Inter';
    const fb = r.customStyles?.fontBody || 'Open Sans';

    const mainHead = (t: string) => `<h3 class="text-sm font-bold uppercase tracking-wider mb-4 border-b-2 pb-1" style="border-color:${sb};color:${sb}">${t}</h3>`;

    const sidebarHTML = `
    <aside class="w-[30%] p-8 flex flex-col gap-8 text-white min-h-full" style="background-color:${sb}">
        <div><h3 class="text-sm font-bold uppercase tracking-widest border-b border-white/30 pb-2 mb-4">Contact</h3>
            <div class="space-y-3 text-sm">
                ${p.phone?`<div class="opacity-90">${esc(p.phone)}</div>`:''}${p.email?`<div class="opacity-90 break-all">${esc(p.email)}</div>`:''}
                ${p.location?`<div class="opacity-90">${esc(p.location)}</div>`:''}${p.linkedin?`<div class="opacity-90 break-all">${esc(p.linkedin.replace(/^https?:\/\//,''))}</div>`:''}
                ${p.website?`<div class="opacity-90 break-all">${esc(p.website.replace(/^https?:\/\//,''))}</div>`:''}
            </div></div>
        ${(r.education||[]).length>0?`<div><h3 class="text-sm font-bold uppercase tracking-widest border-b border-white/30 pb-2 mb-4">Education</h3>
            <div class="space-y-4">${(r.education||[]).map(edu=>`<div><div class="font-bold text-sm">${esc(edu.institution)}</div><div class="text-xs opacity-80">${esc(edu.degree)}</div><div class="text-[10px] opacity-60 uppercase mt-1">${esc(edu.startDate)} – ${esc(edu.endDate)}</div></div>`).join('')}</div></div>`:''}
        ${(r.skills||[]).length>0?`<div><h3 class="text-sm font-bold uppercase tracking-widest border-b border-white/30 pb-2 mb-4">Skills</h3>
            <div class="space-y-4">${(r.skills||[]).map(sg=>`<div><div class="text-xs font-bold opacity-75 uppercase mb-1">${esc(sg.category)}</div><div class="flex flex-wrap gap-2">${(sg.skills||[]).map(s=>`<span class="text-xs bg-white/10 px-2 py-1 rounded">${esc(s)}</span>`).join('')}</div></div>`).join('')}</div></div>`:''}
    </aside>`;

    const contentHTML = `
    <main class="flex-1 p-8 text-slate-800">
        <header class="mb-8"><h1 class="text-4xl font-bold uppercase tracking-tight mb-2" style="color:${sb};font-family:'${fh}',sans-serif">${esc(p.fullName)}</h1>
            <h2 class="text-xl font-medium text-slate-500">${esc((r.experience||[])[0]?.title)}</h2></header>
        ${p.summary?`<section class="mb-8">${mainHead('Profile')}<p class="text-sm leading-relaxed text-slate-600">${esc(p.summary)}</p></section>`:''}
        ${(r.experience||[]).length>0?`<section class="mb-8">${mainHead('Experience')}<div class="space-y-6">${(r.experience||[]).map(exp=>`
            <div><div class="flex justify-between items-baseline mb-1"><h4 class="font-bold text-lg text-slate-800">${esc(exp.title)}</h4><span class="text-xs font-semibold text-slate-500 uppercase">${esc(exp.startDate)} – ${exp.current?'Present':esc(exp.endDate)}</span></div>
            <div class="text-sm font-medium italic mb-2" style="color:${sb}">${esc(exp.company)}, ${esc(exp.location)}</div>
            <div class="text-sm leading-relaxed text-slate-600 whitespace-pre-line pl-1">${esc(exp.description)}</div></div>`).join('')}</div></section>`:''}
        ${(r.leadership||[]).length>0?`<section class="mb-8">${mainHead('Leadership')}<div class="space-y-6">${(r.leadership||[]).map(l=>`
            <div><div class="flex justify-between items-baseline mb-1"><h4 class="font-bold text-lg text-slate-800">${esc(l.title)}</h4><span class="text-xs font-semibold text-slate-500 uppercase">${esc(l.startDate)} – ${esc(l.endDate)}</span></div>
            <div class="text-sm font-medium italic mb-2" style="color:${sb}">${esc(l.company)}</div>
            <div class="text-sm leading-relaxed text-slate-600 whitespace-pre-line pl-1">${esc(l.description)}</div></div>`).join('')}</div></section>`:''}
        ${(r.projects||[]).length>0?`<section class="mb-8">${mainHead('Projects')}${(r.projects||[]).map(proj=>`
            <div class="mb-4"><h4 class="font-bold text-base text-slate-800">${esc(proj.name)}</h4><p class="text-sm text-slate-600">${esc(proj.description)}</p></div>`).join('')}</section>`:''}
    </main>`;

    return wrap(`<div class="flex h-full" style="font-family:'${fb}',sans-serif">${rightSide ? contentHTML + sidebarHTML : sidebarHTML + contentHTML}</div>`, r);
}

// ─── BANNER ───────────────────────────────────────────────────────
function buildBannerHTML(r: Resume): string {
    const p = r.profile || {} as any;
    const ac = r.customStyles?.accentColor || '#3B82F6';
    const fh = r.customStyles?.fontHeading || 'Outfit';
    const fb = r.customStyles?.fontBody || 'Source Sans 3';

    const body = `
    <div class="h-full flex flex-col" style="font-family:'${fb}',sans-serif">
        <header class="p-10 text-white" style="background-color:${ac}">
            <h1 class="text-4xl font-bold uppercase tracking-tight mb-2" style="font-family:'${fh}',sans-serif">${esc(p.fullName)}</h1>
            <h2 class="text-xl font-medium opacity-90 mb-6">${esc((r.experience||[])[0]?.title || 'Professional Role')}</h2>
            <div class="flex flex-wrap gap-6 text-sm font-medium opacity-80">
                ${p.email?`<span>${esc(p.email)}</span>`:''}${p.phone?`<span>${esc(p.phone)}</span>`:''}${p.location?`<span>${esc(p.location)}</span>`:''}${p.linkedin?`<span>LinkedIn</span>`:''}
            </div>
        </header>
        <div class="flex flex-1">
            <aside class="w-[30%] bg-slate-50 p-8 border-r border-slate-200">
                ${(r.skills||[]).length>0?`<div class="mb-8"><h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Skills</h3>
                    <div class="space-y-4">${(r.skills||[]).map(sg=>`<div><div class="text-sm font-bold text-slate-700 mb-1">${esc(sg.category)}</div><div class="text-sm text-slate-500 leading-relaxed">${(sg.skills||[]).join(', ')}</div></div>`).join('')}</div></div>`:''}
                ${(r.education||[]).length>0?`<div class="mb-8"><h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Education</h3>
                    <div class="space-y-4">${(r.education||[]).map(edu=>`<div><div class="font-bold text-sm text-slate-800">${esc(edu.institution)}</div><div class="text-xs text-slate-500">${esc(edu.degree)}</div><div class="text-[10px] text-slate-400 mt-1 uppercase">${esc(edu.startDate)} – ${esc(edu.endDate)}</div></div>`).join('')}</div></div>`:''}
            </aside>
            <main class="flex-1 p-8 text-slate-800">
                ${p.summary?`<section class="mb-8"><h3 class="text-xl font-bold mb-3" style="color:${ac};font-family:'${fh}',sans-serif">Professional Summary</h3><p class="text-sm leading-relaxed text-slate-600">${esc(p.summary)}</p></section>`:''}
                ${(r.experience||[]).length>0?`<section class="mb-8"><h3 class="text-xl font-bold mb-6" style="color:${ac};font-family:'${fh}',sans-serif">Work Experience</h3>
                    <div class="space-y-8">${(r.experience||[]).map(exp=>`
                        <div class="relative pl-4 border-l-2" style="border-color:${ac}">
                            <div class="flex justify-between items-baseline mb-1"><h4 class="font-bold text-lg">${esc(exp.title)}</h4><span class="text-xs font-bold text-slate-400 uppercase">${esc(exp.startDate)} – ${exp.current?'Present':esc(exp.endDate)}</span></div>
                            <div class="text-sm font-semibold mb-2 text-slate-500">${esc(exp.company)}</div>
                            <div class="text-sm leading-relaxed text-slate-600 whitespace-pre-line">${esc(exp.description)}</div>
                        </div>`).join('')}</div></section>`:''}
                ${(r.leadership||[]).length>0?`<section class="mb-8"><h3 class="text-xl font-bold mb-6" style="color:${ac};font-family:'${fh}',sans-serif">Leadership</h3>
                    <div class="space-y-6">${(r.leadership||[]).map(l=>`
                        <div class="relative pl-4 border-l-2" style="border-color:${ac}"><h4 class="font-bold text-base">${esc(l.title)}</h4>
                        <div class="text-sm text-slate-500 mb-2">${esc(l.company)} | ${esc(l.startDate)}</div>
                        <div class="text-sm leading-relaxed text-slate-600">${esc(l.description)}</div></div>`).join('')}</div></section>`:''}
            </main>
        </div>
    </div>`;
    return wrap(body, r);
}
