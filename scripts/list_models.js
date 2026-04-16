const https = require('https');
const fs = require('fs');

const env = fs.readFileSync('c:\\Users\\USER\\Desktop\\shortlist\\.env.local', 'utf-8');
const keyLine = env.split('\n').find(l => l.startsWith('GEMINI_API_KEY='));
const apiKey = keyLine.split('=')[1].trim();

https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const models = json.models.map(m => m.name);
            console.log("AVAILABLE MODELS: ", models.filter(m => m.includes('flash')));
        } catch(e) {
            console.log(data);
        }
    });
}).on('error', err => console.error(err));
