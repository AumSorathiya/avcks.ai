import { Core } from './Core.js';

export class IntelligenceModule {
    constructor() {
        // IMPORTANT: Set your own API key via localStorage.setItem('avcks_api_key', 'YOUR_KEY_HERE')
        // Get your free API key at: https://makersuite.google.com/app/apikey
        this.apiKey = localStorage.getItem('avcks_api_key') || null;
        this.model = "gemini-1.5-flash"; // Default fast model

        if (!this.apiKey) {
            console.warn('AVCKS: No API key configured. AI features will be limited. Set key via: localStorage.setItem("avcks_api_key", "YOUR_KEY")');
        }
    }

    setKey(key) {
        this.apiKey = key;
        localStorage.setItem('avcks_api_key', key);
        Core.log('Intel', 'API Key updated.');
    }

    async ask(query) {
        if (!this.apiKey) {
            console.warn('No API key configured for AI query');
            return null; // Fallback to local processing
        }

        Core.log('Intel', `Querying LLM: ${query}`);

        try {
            const profileContext = window.Profile ? window.Profile.getProfileContext() : "";
            const systemPrompt = `You are AVCKS, an advanced AI command interface. ${profileContext} Keep answers concise and technical.`;

            const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${systemPrompt} User query: ${query}` }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Check if response has expected structure
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                console.error('Unexpected API response structure:', data);
                return "AI processing error. Please try again.";
            }

            return data.candidates[0].content.parts[0].text;
        } catch (e) {
            Core.log('Intel', `API Error: ${e.message}`, 'error');
            return "I am currently unable to bridge the neural link.";
        }
    }
}
