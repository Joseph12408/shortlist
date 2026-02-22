export function extractKeywords(text: string): string[] {
    if (!text) return [];

    // Remove common stop words (very basic list for V1)
    const stopWords = new Set([
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "of", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "should", "can", "could", "may", "might", "must", "if", "then", "else", "when",
        "where", "why", "how", "what", "who", "which", "that", "this", "these", "those", "it", "its", "they", "them", "their", "we", "us", "our",
        "you", "your", "he", "him", "his", "she", "her", "hers", "me", "my", "mine", "i", "myself", "yourself", "himself", "herself", "itself",
        "themselves", "ourselves", "yourselves", "job", "description", "requirements", "responsibilities", "qualifications", "experience", "role",
        "candidate", "team", "work", "looking", "seeking", "opportunity", "position", "company", "clients", "services", "solutions", "business",
        "support", "help", "provide", "create", "build", "develop", "design", "manage", "lead", "drive", "deliver", "ensure", "maintain", "improve"
    ]);

    // Normalize text
    const distinctWords = new Set<string>();

    // 1. Extract potential skills (capitalized words like "React", "Python", "AWS")
    // We look for words that start with a capital letter, are not at the start of a sentence (hard to heuristically determine perfectly without NLP, but we can try)
    // For V1, let's just grab all unique words, filter out stop words, and maybe prioritize capitalized ones in a "dumb" way.

    // Better V1 approach: split by non-alphanumeric, filter stop words, keep everything else as candidate.
    // Then prioritize ones that appear in a "tech skills" list if we had one.
    // Since we don't have a database, we'll rely on frequency and capitalization.

    const words = text.replace(/[^\w\s-]/g, "").split(/\s+/);

    words.forEach(word => {
        const cleanWord = word.replace(/[^a-zA-Z0-9+]/g, ""); // keep + for C++
        if (cleanWord.length > 2 && !stopWords.has(cleanWord.toLowerCase())) {
            distinctWords.add(cleanWord);
        }
    });

    return Array.from(distinctWords);
}

// A slightly smarter extract that tries to find phrases could go here later.
