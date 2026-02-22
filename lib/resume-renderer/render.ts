import fs from 'fs';
import path from 'path';
import { Resume } from '@/types/resume';

// HELPER FUNCTIONS
function generateExperienceHTML(items: any[]): string {
    if (!items || !Array.isArray(items)) return '';
    return items.map(item => `
        <div class="job-item">
            <div class="job-header">
                <div>
                    <span class="job-role">${item.title || item.role || ''}</span>
                    <span class="separator">at</span>
                    <span class="job-company">${item.company || ''}</span>
                </div>
                <span class="job-date">${item.date || (item.startDate + ' — ' + (item.current ? 'Present' : item.endDate))}</span>
            </div>
            <ul class="job-description">
                ${(item.description ? `<li>${item.description}</li>` : '')} 
                ${(item.details || []).map((detail: string) => `<li>${detail}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

function generateEducationHTML(items: any[]): string {
    if (!items || !Array.isArray(items)) return '';
    return items.map(item => `
        <div class="education-item">
            <div class="job-header">
                <span class="degree">${item.degree || ''} ${item.fieldOfStudy ? `in ${item.fieldOfStudy}` : ''}</span>
                <span class="job-date">${item.date || (item.startDate + ' — ' + (item.current ? 'Present' : item.endDate))}</span>
            </div>
            <div class="institution">${item.institution || ''}</div>
        </div>
    `).join('');
}

function generateSkillsHTML(skills: any[]): string {
    if (!skills || !Array.isArray(skills)) return '';
    // Handle both string[] and object[] format
    return skills.map(skillGroup => {
        if (typeof skillGroup === 'string') return `<span class="skill-tag">${skillGroup}</span>`;
        // Structured skill category
        return `
            <div class="skill-category">
                <span class="skill-category-name">${skillGroup.category}:</span>
                <span class="skill-items">${Array.isArray(skillGroup.skills) ? skillGroup.skills.join(', ') : skillGroup.skills}</span>
            </div>
        `;
    }).join('');
}

function generateModernContactHTML(profile: any): string {
    const fields = [
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'location', label: 'Location' },
        { key: 'website', label: 'Website' },
        { key: 'linkedin', label: 'LinkedIn' }
    ];

    return fields.map(field => {
        const value = profile[field.key];
        if (!value) return '';

        // Format value if needed (e.g. strip https from website)
        let displayValue = value;
        if (field.key === 'website' || field.key === 'linkedin') {
            displayValue = displayValue.replace(/^https?:\/\//, '');
        }

        return `
            <div class="contact-item">
                <span class="label">${field.label}</span>
                <span class="value">${field.key === 'website' || field.key === 'linkedin' ? `<a href="${value}" target="_blank">${displayValue}</a>` : displayValue}</span>
            </div>
        `;
    }).join('');
}


/**
 * Generates a PDF buffer from resume data
 * @param {Resume} resumeData - The resume data object
 * @returns {Promise<Buffer>} - The PDF buffer
 */
export async function generatePDF(resumeData: Resume): Promise<Buffer> {

    // SETUP LOGGING
    const logFile = path.join(process.cwd(), 'debug-render.log');
    const log = (msg: string) => {
        try {
            const timestamp = new Date().toISOString();
            fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
            console.log(msg); // Check server console too
        } catch (e) {
            console.error(msg);
        }
    };

    log("🚀 Starting PDF Generation... (v3 Production)");
    let browser = null;

    try {
        log("Importing puppeteer...");
        const puppeteer = (await import('puppeteer')).default;

        const rendererRoot = path.join(process.cwd(), 'lib', 'resume-renderer');
        const theme = resumeData.customStyles?.theme || 'modern';
        log(`Theme selected: ${theme}`);

        let templateFilename = 'modern.html';
        const lowerTheme = theme.toLowerCase();

        // Template Selection Logic
        if (lowerTheme === 'classic') {
            templateFilename = 'classic.html';
            log("Matched 'classic', using classic.html");
        }
        else if (lowerTheme === 'minimal') templateFilename = 'minimal.html';
        else if (lowerTheme === 'efficient') templateFilename = 'efficient.html';
        else if (lowerTheme === 'sidebar') templateFilename = 'sidebar.html';
        else if (lowerTheme === 'sidebar_right') templateFilename = 'sidebar_right.html';
        else if (lowerTheme === 'banner') templateFilename = 'banner.html';
        else if (lowerTheme === 'standard') {
            templateFilename = 'classic.html';
            log("Matched 'standard', using classic.html");
        }
        else {
            templateFilename = 'modern.html';
            log(`Matched default/modern, using modern.html`);
        }

        const templatePath = path.join(rendererRoot, 'templates', templateFilename);
        log(`Looking for template at: ${templatePath}`);

        const cssPath = path.join(rendererRoot, 'styles', 'base.css');

        let useTemplatePath = templatePath;
        if (!fs.existsSync(templatePath)) {
            log(`❌ Template not found at ${templatePath}, falling back to modern.html`);
            useTemplatePath = path.join(rendererRoot, 'templates', 'modern.html');
        } else {
            log(`✅ Template found.`);
        }

        let htmlContent = fs.readFileSync(useTemplatePath, 'utf8');
        const cssContent = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
        log(`Read CSS content length: ${cssContent.length}`);

        // MAPPING
        const profile = resumeData.profile || {};
        const safeData = {
            name: profile.fullName || 'Your Name',
            current_role: profile.headline || resumeData.experience?.[0]?.title || '',
            email: profile.email || '',
            phone: profile.phone || '',
            location: profile.location || '',
            summary: profile.summary || '',
            website: profile.website || '',
            linkedin: profile.linkedin || '',
        };

        const experienceItems = resumeData.experience || [];
        const educationItems = resumeData.education || [];
        const skillsItems = resumeData.skills || [];

        const replacements: Record<string, string> = {
            '{{name}}': safeData.name,
            '{{current_role}}': safeData.current_role,
            '{{email}}': safeData.email,
            '{{phone}}': safeData.phone,
            '{{location}}': safeData.location,
            '{{summary}}': safeData.summary,
            '{{website}}': safeData.website,
            '{{linkedin}}': safeData.linkedin,
            '{{skills_html}}': generateSkillsHTML(skillsItems),
            '{{skills_html}}': generateSkillsHTML(skillsItems),
            '{{experience_html}}': generateExperienceHTML(experienceItems),
            '{{education_html}}': generateEducationHTML(educationItems),
            '{{modern_contact_html}}': generateModernContactHTML(profile)
        };

        Object.keys(replacements).forEach(key => {
            htmlContent = htmlContent.replace(new RegExp(key, 'g'), replacements[key]);
        });

        const flatSkills = skillsItems.map((s: any) => s.skills ? s.skills.join(', ') : s.name).join(' • ');
        htmlContent = htmlContent.replace(new RegExp('{{skills}}', 'g'), flatSkills);

        // STYLES
        if (resumeData.customStyles) {
            const { accentColor, fontHeading, fontBody } = resumeData.customStyles;

            // Base CSS + Google Imports + Overrides
            let finalCss = `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@400;700&family=Merriweather:wght@300;400;700&family=Source+Sans+3:wght@300;400;600&display=swap');
                ${cssContent}
                :root {
             `;

            if (accentColor) finalCss += ` --accent-color: ${accentColor} !important;`;
            if (fontHeading) finalCss += ` --heading-font: '${fontHeading}', sans-serif !important;`;
            if (fontBody) finalCss += ` --body-font: '${fontBody}', sans-serif !important;`;

            // Add other style tokens if they exist
            if (resumeData.customStyles.primaryColor) finalCss += ` --primary-color: ${resumeData.customStyles.primaryColor} !important;`;

            finalCss += ' }';

            if (htmlContent.includes('<link rel="stylesheet"')) {
                htmlContent = htmlContent.replace(/<link rel="stylesheet"[^>]*>/, `<style>${finalCss}</style>`);
            } else {
                htmlContent = htmlContent.replace('</head>', `<style>${finalCss}</style></head>`);
            }
        } else {
            htmlContent = htmlContent.replace(/<link rel="stylesheet"[^>]*>/, `<style>${cssContent}</style>`);
        }

        log("Launching browser...");

        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--font-render-hinting=none'
            ],
            timeout: 30000 // Standard timeout
        });

        const page = await browser.newPage();

        // Use 'load' for fonts, but keep timeout reasonable
        await page.setContent(htmlContent, {
            waitUntil: 'load',
            timeout: 20000
        });

        log("Generating PDF...");
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
        });
        log(`✅ PDF Generated. Size: ${pdfBuffer.length}`);

        return Buffer.from(pdfBuffer);

    } catch (error: any) {
        log(`❌ Generation Failed: ${error.message}`);
        log(`Stack: ${error.stack}`);
        console.error("❌ Generation Failed:", error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
