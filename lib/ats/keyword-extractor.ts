export function extractKeywords(text: string): string[] {
    if (!text) return [];

    // Expanded stop words list
    const stopWords = new Set([
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "of", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "should", "can", "could", "may", "might", "must", "if", "then", "else", "when",
        "where", "why", "how", "what", "who", "which", "that", "this", "these", "those", "it", "its", "they", "them", "their", "we", "us", "our",
        "you", "your", "he", "him", "his", "she", "her", "hers", "me", "my", "mine", "i", "myself", "yourself", "himself", "herself", "itself",
        "themselves", "ourselves", "yourselves", "job", "description", "requirements", "responsibilities", "qualifications", "experience", "role",
        "candidate", "team", "work", "looking", "seeking", "opportunity", "position", "company", "clients", "services", "solutions", "business",
        "support", "help", "provide", "create", "build", "develop", "design", "manage", "lead", "drive", "deliver", "ensure", "maintain", "improve",
        "strong", "excellent", "good", "proven", "track", "record", "skills", "ability", "knowledge", "understanding", "preferred", "required",
        "years", "degree", "bachelor", "master", "phd", "equivalent", "related", "field", "environment", "fast-paced", "details", "attention",
        "communication", "written", "verbal", "collaborate", "cross-functional", "stakeholders", "projects", "problems", "solving", "analytical",
        "such", "as", "from", "about", "into", "over", "after", "beneath", "under", "above", "through", "during", "before"
    ]);

    const words = text.replace(/[^\w\s\+\-#\.]/g, " ")
        .split(/\s+/)
        .map(w => w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9\+\#\.]+$/g, "")) // Trim punctuation from edges
        .filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()));

    const keywordFrequencies = new Map<string, number>();

    // 1. Single words
    for (const word of words) {
        const cleanWord = word;
        if (cleanWord.length > 2) {
             const key = cleanWord.toLowerCase();
             keywordFrequencies.set(key, (keywordFrequencies.get(key) || 0) + 1);
        }
    }

    // 2. Bigrams (two-word phrases)
    for (let i = 0; i < words.length - 1; i++) {
        const w1 = words[i].toLowerCase();
        const w2 = words[i+1].toLowerCase();
        
        // Only form bigrams if neither word is a stop word (already filtered, but good to be sure)
        // and both words are significant
        const bigram = `${words[i]} ${words[i+1]}`;
        const key = bigram.toLowerCase();
        
        // Give bigrams slightly higher weight or just count them
        // Let's count them and we'll boost their score in the sort
        keywordFrequencies.set(key, (keywordFrequencies.get(key) || 0) + 1);
    }

    // Sort by frequency (descending). We give a 1.5x boost to bigrams because multi-word requirements are usually more specific (e.g., "machine learning" vs "machine").
    const sortedKeywords = Array.from(keywordFrequencies.entries())
        .sort((a, b) => {
            const scoreA = a[0].includes(' ') ? a[1] * 1.5 : a[1];
            const scoreB = b[0].includes(' ') ? b[1] * 1.5 : b[1];
            if (scoreB === scoreA) {
                return b[0].length - a[0].length; // prefer longer words/phrases if tie
            }
            return scoreB - scoreA;
        })
        .map(entry => {
             // Return original capitalization approximation by finding it in the original words
             const original = words.find(w => w.toLowerCase() === entry[0]) || 
                              words.find(w => entry[0].includes(w.toLowerCase())) || entry[0];
             // For bigrams we might want to title case them or leave lowercase 
             return entry[0].includes(' ') ? entry[0] : original;
        });

    // Remove overlapping single words if their bigram is highly ranked
    const filteredKeywords: string[] = [];
    const bigramsFound = new Set<string>();

    for (const kw of sortedKeywords) {
        if (kw.includes(' ')) {
            filteredKeywords.push(kw);
            kw.split(' ').forEach(w => bigramsFound.add(w));
        } else {
            // Only add single word if it wasn't already covered by a strongly ranked bigram
            if (!bigramsFound.has(kw.toLowerCase())) {
                filteredKeywords.push(kw);
            }
        }
    }

    return filteredKeywords.slice(0, 30); // Return top 30
}
