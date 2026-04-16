import fs from 'fs';

async function testPdf() {
    const resumeData = {
        profile: { fullName: "Test User", email: "test@test.com" }
    };
    
    try {
        const res = await fetch('http://localhost:3000/api/download-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume: resumeData })
        });
        
        console.log("Status:", res.status);
        console.log("Headers:", Object.fromEntries(res.headers.entries()));
        
        if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            fs.writeFileSync('test-out.pdf', Buffer.from(arrayBuffer));
            console.log("Wrote test-out.pdf with size:", arrayBuffer.byteLength);
        } else {
            const text = await res.text();
            console.log("Error response:", text);
        }
    } catch (e) {
        console.error("Net error:", e);
    }
}

testPdf();
