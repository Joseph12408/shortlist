const fs = require('fs');

(async () => {
    const themes = [
        'modern', 'classic', 'efficient', 'sidebar',
        'sidebar_right', 'banner', 'minimal', 'standard'
    ];

    for (const theme of themes) {
        console.log(`Testing theme: ${theme}`);

        const resumeData = {
            id: '123',
            profile: {
                fullName: 'John Doe',
                email: 'john@example.com',
                phone: '123-456-7890',
                location: 'New York, NY',
                headline: 'Software Engineer',
                summary: 'Experienced developer.'
            },
            experience: [{
                company: 'Tech Corp',
                title: 'Senior Dev',
                startDate: '2020',
                endDate: 'Present',
                description: 'Built things.'
            }],
            education: [],
            skills: ['React', 'Node.js'],
            customStyles: {
                theme: theme,
                primaryColor: '#1e3a8a',
                accentColor: '#3b82f6'
            }
        };

        try {
            const response = await fetch('http://localhost:3000/api/download-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resumeData)
            });

            if (response.ok) {
                const buffer = await response.arrayBuffer();
                fs.writeFileSync(`test-output-${theme}.pdf`, Buffer.from(buffer));
                console.log(`✅ Saved test-output-${theme}.pdf`);
            } else {
                console.error(`❌ Failed ${theme}:`, await response.text());
            }
        } catch (e) {
            console.error(`❌ Error ${theme}:`, e);
        }

        // Small delay to separate logs
        await new Promise(r => setTimeout(r, 1000));
    }
})();
