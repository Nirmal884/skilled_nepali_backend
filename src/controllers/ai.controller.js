const { GoogleGenAI } = require('@google/genai');

class AIController {
    static async handleChat(req, res) {
        try {
            const { message, language, history = [] } = req.body;

            if (!message) {
                return res.status(400).json({ error: 'Message is required' });
            }

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                console.warn('GEMINI_API_KEY is not defined in backend .env file. Falling back to mock responses.');
            }

            // Map frontend language selector value to human readable string for Gemini
            const languageMap = {
                english: 'English',
                nepali: 'Nepali',
                arabic: 'Arabic',
                hindi: 'Hindi',
                malayalam: 'Malayalam'
            };

            const targetLang = languageMap[String(language).toLowerCase()] || 'English';

            const systemPrompt = `You are the Kaamdaar AI Assistant. Keep answers under 3 sentences.
Kaamdaar bridges skilled Nepali talent with GCC employers (UAE, Qatar, Saudi Arabia, Bahrain, Oman, Kuwait).
Services: GCC recruitment, training courses, visa support, career counseling.
Roles: Jobseekers (free profile/apply), Employers (post jobs/subscriptions), Training Centers (list courses).
Contact: +91 7510105159 | info@kaamdaar.com | Sinamangal-9, Kathmandu | Mon-Fri 9-7.

Rules:
1. Answer questions about the platform concisely.
2. Selected Language: ${targetLang}. Respond ONLY in ${targetLang}.
3. If unsure, redirect to contact details.`;

            // Prepare history format for Gemini SDK (Sliding Window: last 6 messages / 3 turns)
            const contents = [];
            const recentHistory = Array.isArray(history) ? history.slice(-6) : [];

            recentHistory.forEach(item => {
                if (item.sender === 'user') {
                    contents.push({
                        role: 'user',
                        parts: [{ text: item.text }]
                    });
                } else if (item.sender === 'bot') {
                    contents.push({
                        role: 'model',
                        parts: [{ text: item.text }]
                    });
                }
            });

            // Append current message
            contents.push({
                role: 'user',
                parts: [{ text: message }]
            });

            if (!apiKey) {
                // Return dummy response if API key is not present (for development safety)
                let reply = `[Mock Response in ${targetLang}] Welcome to Kaamdaar! This is a test response as GEMINI_API_KEY is not set in backend .env. Please configure GEMINI_API_KEY to get real AI replies. You asked: "${message}"`;
                if (targetLang === 'Arabic') {
                    reply = `مرحباً بك في Kaamdaar! هذا رد تجريبي لأن مفتاح GEMINI_API_KEY غير مهيأ. سؤالك: "${message}"`;
                } else if (targetLang === 'Nepali') {
                    reply = `Kaamdaar मा यहाँलाई स्वागत छ! GEMINI_API_KEY सेट नभएको हुनाले यो नमूना प्रतिक्रिया हो। तपाईंको प्रश्न: "${message}"`;
                }
                return res.json({ response: reply });
            }

            // Call Gemini API using the @google/genai SDK
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.6,
                    maxOutputTokens: 500 // Reduced from 800 to prevent long/expensive outputs
                }
            });

            const responseText = response.text || "I'm sorry, I couldn't process that response.";
            return res.json({ response: responseText });
        } catch (error) {
            console.error('AI Chatbot Controller Error:', error);
            return res.status(500).json({ error: 'Failed to process AI chat request' });
        }
    }
}

module.exports = AIController;
