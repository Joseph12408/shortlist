import { generatePDF } from './lib/resume-renderer/render.ts';
import fs from 'fs';

async function testPdf() {
    console.log("Starting test pdf generation...");
    const resumeData = {
        profile: { fullName: "Test User", email: "test@test.com" }
    };
    
    try {
        const pdfBuffer = await generatePDF(resumeData);
        fs.writeFileSync('test-out-manual.pdf', pdfBuffer);
        console.log("Wrote test-out-manual.pdf with size:", pdfBuffer.length);
    } catch (e) {
        console.error("Failed to generate:", e);
    }
}

testPdf();
