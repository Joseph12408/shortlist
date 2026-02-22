import fs from 'fs';
import path from 'path';
import { Resume } from '@/types/resume';

interface CoverLetterData {
    id: string;
    title: string;
    recipient: string;
    company: string;
    jobTitle: string;
    body: string;
    lastUpdated: string;
}

// Helper to strip duplicate headers/footers if they exist in the body
function cleanBodyContent(body: string): string {
    if (!body) return 'No content provided.';

    let clean = body;

    // 1. Remove standard dates at start (e.g., "October 24, 2024")
    clean = clean.replace(/^[A-Z][a-z]+ \d{1,2},? \d{4}\s*/, '');

    // 2. Remove standard greetings at start
    // Matches: "Dear Hiring Manager," "Dear [Name]," etc.
    // We replace it only if it's at the very start
    clean = clean.replace(/^Dear .+,?\s*/, '');

    // 3. Remove standard closings at end
    // Matches: "Sincerely," "Best regards," followed by name/text
    // We look for the last occurrence
    clean = clean.replace(/(Sincerely|Best regards|Warm regards|Respectfully|Yours truly),?(\s*\n\s*.*)*$/i, '');

    // 4. Remove RE: lines if present at start
    clean = clean.replace(/^RE:.*\n/im, '');

    return clean.trim();
}

function toTitleCase(str: string): string {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

export async function generateCoverLetterPDF(coverLetter: CoverLetterData, resume: Resume): Promise<Buffer> {

    // LOGGING SETUP
    const logFile = path.join(process.cwd(), 'debug-render-cl.log');
    const log = (msg: string) => {
        try {
            const timestamp = new Date().toISOString();
            fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
        } catch (e) {
            console.error(msg);
        }
    };

    log(`🚀 Starting Cover Letter PDF Generation for: ${coverLetter.title}`);

    let browser = null;

    try {
        const puppeteer = (await import('puppeteer')).default;

        // Styles - Reusing base styles but specialized for letter
        const cssPath = path.join(process.cwd(), 'lib', 'resume-renderer', 'styles', 'base.css');
        const cssContent = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';

        const { customStyles } = resume;
        const fontBody = customStyles?.fontBody || 'Open Sans';
        const fontHeading = customStyles?.fontHeading || 'Inter';
        const accentColor = customStyles?.accentColor || '#3B82F6';

        // simple clean layout
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@400;700&family=Merriweather:wght@300;400;700&family=Great+Vibes&display=swap');
                
                :root {
                    --primary-color: #111827;
                    --accent-color: ${accentColor};
                    --heading-font: '${fontHeading}', sans-serif;
                    --body-font: '${fontBody}', sans-serif;
                }

                body {
                    font-family: var(--body-font);
                    color: #334155;
                    line-height: 1.5;
                    margin: 0;
                    padding: 0; 
                    font-size: 10.5pt;
                }

                .page-container {
                    padding: 40px 50px;
                    max-width: 100%;
                }

                .header {
                    border-bottom: 2px solid var(--accent-color);
                    padding-bottom: 15px;
                    margin-bottom: 25px;
                }

                .name {
                    font-family: var(--heading-font);
                    font-size: 20pt;
                    font-weight: 700;
                    color: var(--primary-color);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .contact-info {
                    margin-top: 8px;
                    font-size: 9pt;
                    color: #64748b;
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .meta-block {
                    margin-bottom: 20px;
                }

                .date {
                    font-weight: 600;
                    margin-bottom: 15px;
                }

                .re-line {
                    font-weight: 700;
                    text-transform: uppercase;
                    margin-bottom: 15px;
                }

                .greeting {
                    margin-bottom: 15px;
                }

                .body-content {
                    white-space: pre-wrap;
                    text-align: justify;
                    margin-bottom: 25px;
                }

                .body-content p {
                    margin-bottom: 1em;
                }

                .signature-block {
                    margin-top: 10px;
                }
                
                .signature-font {
                    font-family: "Brush Script MT", "Segoe Script", cursive;
                    font-size: 24pt;
                    color: var(--primary-color);
                    margin-bottom: 5px;
                }
            </style>
        </head>
        <body>
            <div class="page-container">
                <div class="header">
                    <div class="name">${resume.profile.fullName || 'Your Name'}</div>
                    <div class="contact-info">
                        ${resume.profile.email ? `<span>${resume.profile.email}</span>` : ''}
                        ${resume.profile.phone ? `<span>• ${resume.profile.phone}</span>` : ''}
                        ${resume.profile.location ? `<span>• ${resume.profile.location}</span>` : ''}
                        ${resume.profile.linkedin ? `<span>• ${resume.profile.linkedin.replace(/^https?:\/\//, '')}</span>` : ''}
                    </div>
                </div>

                <div class="meta-block">
                    <div class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    
                    ${coverLetter.jobTitle || coverLetter.company ?
                `<div class="re-line">RE: ${coverLetter.jobTitle || 'Application'} ${coverLetter.company ? `at ${coverLetter.company}` : ''}</div>`
                : ''}
                    
                    <div class="greeting">Dear Hiring Manager,</div>
                </div>

                <div class="body-content">
                    ${cleanBodyContent(coverLetter.body)}
                </div>

                <div class="signature-block">
                    <div>Sincerely,</div>
                    <div class="signature-font">${toTitleCase(resume.profile.fullName || 'Candidate')}</div>
                    <div style="font-family: var(--heading-font); font-weight: 600; font-size: 11pt;">${toTitleCase(resume.profile.fullName || 'Candidate')}</div>
                </div>
            </div>
        </body>
        </html>
        `;

        log("Launching browser...");
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        // Use 'load' instead of 'networkidle0' to be more robust against slow external resources (fonts)
        await page.setContent(htmlContent, {
            waitUntil: 'load',
            timeout: 60000 // Increase to 60s just in case
        });

        log("Generating PDF...");
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
        });

        log(`✅ Cover Letter PDF Generated. Size: ${pdfBuffer.length}`);
        return Buffer.from(pdfBuffer);

    } catch (error: any) {
        log(`❌ Generation Failed: ${error.message}`);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}
