export async function generateContentWithFallback(prompt: string, apiKey: string, config: any) {
    // We try models in order of preference. 2.5-flash is best but may experience high demand.
    // 2.0-flash is extremely stable and acts as our reliable fallback.
    const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-2.0-flash', 
        'gemini-flash-latest'
    ];

    let lastError = null;

    for (const model of modelsToTry) {
        console.log(`[AI] Attempting generation with model: ${model}`);
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: config
                    }),
                    // add a timeout context if needed, but Next.js fetch usually uses AbortController for fine control
                }
            );

            const data = await response.json();

            // If the model is totally overloaded, Google API returns a 503 or 429 inside data.error
            if (data.error) {
                const isHighDemand = data.error.message?.toLowerCase().includes('high demand') ||
                                     data.error.code === 503 ||
                                     data.error.code === 429;
                
                if (isHighDemand) {
                    console.warn(`[AI] Model ${model} is experiencing high demand. Falling back to next model...`);
                    lastError = new Error(data.error.message);
                    continue; // try next model
                }
                
                // If it's a different error (e.g. bad request, policy violation), throw immediately
                throw new Error(data.error.message);
            }

            return data;
            
        } catch (error: any) {
            console.warn(`[AI] Network or unexpected error with model ${model}:`, error.message);
            lastError = error;
            // continue to next model
        }
    }

    // If we exhaust all models
    console.error('[AI] All models exhausted or failed.');
    throw lastError || new Error('Failed to generate content after trying multiple models.');
}
