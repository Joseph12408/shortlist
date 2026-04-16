
import puppeteer from 'puppeteer';
import fs from 'fs';

async function test() {
    try {
        console.log("Launching browser...");
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent('<h1>Hello World</h1>');
        const pdf = await page.pdf({ format: 'A4' });
        fs.writeFileSync('test.pdf', pdf);
        console.log("PDF generated: test.pdf");
        await browser.close();
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
