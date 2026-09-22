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
                model: process.env.GEMINI_MODEL,
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

    static async voiceToText(req, res) {
        try {
            const { language } = req.body;
            const audioFile = req.file;

            if (!audioFile) {
                return res.status(400).json({ error: 'Audio file is required' });
            }

            const apiKey = process.env.TRANSLATION_API_KEY;
            if (!apiKey) {
                return res.status(500).json({ error: 'TRANSLATION_API_KEY is not defined in backend' });
            }

            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: process.env.GEMINI_MODEL,
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                inlineData: {
                                    data: audioFile.buffer.toString('base64'),
                                    mimeType: audioFile.mimetype || 'audio/webm'
                                }
                            },
                            {
                                text: `You are an expert audio transcriber and translator.
The attached audio is a candidate describing their career for a resume. The user has selected the language: ${language || 'English'}.
The recording might be in Malayalam, Nepali, or English.
Please translate and transcribe the audio into clean, grammatically correct English text.
Do NOT summarize or shorten their points. Keep all responsibilities and numbers they mention.
Format the output clearly under the following section headers:
SUMMARY
SKILLS
EXPERIENCE
EDUCATION
CERTIFICATIONS
LANGUAGES

Ensure that all these headers are present in the final output text, even if they are empty under some headers.`
                            }
                        ]
                    }
                ]
            });

            const text = response.text || "";
            return res.json({ text });
        } catch (error) {
            console.error('Voice-to-Text API Error:', error);
            return res.status(500).json({ error: 'Failed to process audio recording' });
        }
    }

    static async parseResumeJson(req, res) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text content is required' });
            }

            const apiKey = process.env.TRANSLATION_API_KEY;
            if (!apiKey) {
                return res.status(500).json({ error: 'TRANSLATION_API_KEY is not defined in backend' });
            }

            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: process.env.GEMINI_MODEL,
                contents: `Extract all candidate resume fields from the following text into structured JSON format:
                
"${text}"`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: 'OBJECT',
                        properties: {
                            fullName: { type: 'STRING' },
                            title: { type: 'STRING' },
                            email: { type: 'STRING' },
                            phone: { type: 'STRING' },
                            location: { type: 'STRING', description: 'City, Country' },
                            careerSummary: { type: 'STRING', description: 'Professional bio or career summary' },
                            skills: {
                                type: 'ARRAY',
                                items: { type: 'STRING' }
                            },
                            languages: {
                                type: 'ARRAY',
                                items: { type: 'STRING' }
                            },
                            experiences: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        companyName: { type: 'STRING' },
                                        role: { type: 'STRING' },
                                        location: { type: 'STRING' },
                                        startDate: { type: 'STRING', description: 'YYYY-MM-DD format (approximate if year only)' },
                                        endDate: { type: 'STRING', description: 'YYYY-MM-DD format (or empty if current)' },
                                        isCurrent: { type: 'BOOLEAN' },
                                        description: { type: 'STRING', description: 'Duties and accomplishments' }
                                    },
                                    required: ['companyName', 'role']
                                }
                            },
                            educations: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        institution: { type: 'STRING' },
                                        degree: { type: 'STRING', description: 'Field of study or degree title' },
                                        startDate: { type: 'STRING', description: 'YYYY-MM-DD' },
                                        endDate: { type: 'STRING', description: 'YYYY-MM-DD' },
                                        isCompleted: { type: 'BOOLEAN' }
                                    },
                                    required: ['institution', 'degree']
                                }
                            },
                            certifications: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        certificationName: { type: 'STRING' },
                                        issuingAuthority: { type: 'STRING' },
                                        issueDate: { type: 'STRING', description: 'YYYY-MM-DD' }
                                    },
                                    required: ['certificationName']
                                }
                            }
                        }
                    }
                }
            });

            let data = {};
            if (response.text) {
                data = JSON.parse(response.text);
            }
            return res.json(data);
        } catch (error) {
            console.error('Parse Resume JSON Error:', error);
            return res.status(500).json({ error: 'Failed to parse resume text into JSON' });
        }
    }

    static async refineJobDescription(req, res) {
        try {
            const {
                title,
                description,
                category,
                type,
                location,
                country,
                experience,
                minSalary,
                maxSalary,
                currency,
                responsibilities = [],
                requirements = []
            } = req.body;

            const trimmedTitle = title ? String(title).trim() : '';
            const trimmedDescription = description ? String(description).trim() : '';

            if (!trimmedTitle && !trimmedDescription) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a job title or some initial description notes to refine.'
                });
            }

            const companyName = req.user?.companyName || req.user?.name || 'Our Company';
            const apiKey = process.env.GEMINI_API_KEY || process.env.TRANSLATION_API_KEY;

            let salaryInfo = '';
            if (minSalary || maxSalary) {
                salaryInfo = `${currency || 'AED'} ${minSalary || 0} - ${maxSalary || 'Negotiable'}`;
            }

            const cleanResponsibilities = Array.isArray(responsibilities)
                ? responsibilities.filter(r => typeof r === 'string' && r.trim()).map(r => r.trim())
                : [];
            const cleanRequirements = Array.isArray(requirements)
                ? requirements.filter(r => typeof r === 'string' && r.trim()).map(r => r.trim())
                : [];

            const fallbackText = `We are seeking a dedicated and skilled ${trimmedTitle || 'professional'} to join ${companyName}${location ? ` in ${location}` : ''}${country ? `, ${country}` : ''}. In this role, you will be responsible for executing high-standard day-to-day operations, ensuring quality and efficiency, and adhering strictly to safety and industry guidelines.

The ideal candidate will bring strong problem-solving capabilities, technical expertise relevant to ${category || 'the domain'}, and the ability to work collaboratively in a dynamic team setting. Key operational duties include managing routine workflows, operating standard equipment safely, maintaining quality benchmarks, and coordinating with supervisors to ensure timely task completion.

We offer a professional and supportive work environment designed to empower team members to succeed and grow. Candidates with a proactive mindset, dedication to safety, and a commitment to excellence are strongly encouraged to apply.`;

            if (!apiKey) {
                console.warn('GEMINI_API_KEY / TRANSLATION_API_KEY is not defined. Using smart fallback for refineJobDescription.');

                return res.json({
                    success: true,
                    message: 'Job description refined successfully (Development Mode)',
                    data: {
                        refinedDescription: fallbackText
                    }
                });
            }

            const systemPrompt = `You are an expert HR and talent recruitment specialist for Kaamdaar, a leading platform connecting skilled Nepali talent with reputable employers in the GCC (UAE, Qatar, Saudi Arabia, Bahrain, Oman, Kuwait) and globally.

Your task is to refine and generate a crystal-clear, professional, comprehensive, and engaging Job Description for an employer posting a job vacancy.

CONTEXT PROVIDED BY EMPLOYER:
- Job Title: ${trimmedTitle || 'Not specified'}
- Industry / Category: ${category || 'General'}
- Job Type: ${type || 'Full-time'}
- Location: ${location || ''}${country ? (location ? `, ${country}` : country) : ''}
- Experience Level: ${experience || 'Not specified'}
- Company: ${companyName}
${salaryInfo ? `- Compensation: ${salaryInfo}` : ''}
${cleanResponsibilities.length ? `- Employer's Key Responsibilities: ${cleanResponsibilities.join('; ')}` : ''}
${cleanRequirements.length ? `- Employer's Key Requirements: ${cleanRequirements.join('; ')}` : ''}

CURRENT DRAFT / ROUGH NOTES ENTERED BY EMPLOYER:
"""
${trimmedDescription || 'No initial draft provided. Generate a complete, industry-standard description based on the job title and context above.'}
"""

INSTRUCTIONS:
1. CLARITY & PROFESSIONAL STRUCTURE:
   - Write a clear, engaging, and professional job description structured into 2 to 3 cohesive paragraphs:
     * Paragraph 1 (Role Overview & Mission): Clearly define the core purpose of the role, how it contributes to the company's operations, and its main mission.
     * Paragraph 2 (Operational Scope & Specifics): Fetch and incorporate extra industry-standard operational details relevant to this role (e.g., specific workflows, equipment/tools used, safety protocols, quality standards, and day-to-day coordination).
     * Paragraph 3 (Work Environment & Expectations): Describe the workplace culture, professional expectations, safety culture, and the supportive environment offered to candidates working in this location.

2. FETCH EXTRA DETAILS INTELLIGENTLY:
   - If the employer's notes are brief or incomplete, enrich the description with realistic, role-specific responsibilities, day-to-day context, and technical expectations standard for this occupation.
   - If the employer already included specific notes, constraints, or benefits, preserve them faithfully and integrate them seamlessly.

3. STRICT FORMATTING RULES:
   - Return ONLY the refined job description text.
   - Separate paragraphs with double newlines.
   - DO NOT include conversational intro or outro text (such as "Here is your refined job description:", "Certainly!", or "Good luck with hiring!").
   - DO NOT include markdown headers (like "# Job Description" or "### Summary"). Just clean, polished paragraphs suitable for a form textarea.`;

            let refinedText = '';
            try {
                const ai = new GoogleGenAI({ apiKey });
                const response = await ai.models.generateContent({
                    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: systemPrompt }]
                        }
                    ],
                    config: {
                        temperature: 0.6,
                        maxOutputTokens: 1200
                    }
                });

                refinedText = response.text ? response.text.trim() : '';
            } catch (geminiError) {
                console.warn('Gemini API call failed, applying fallback generator:', geminiError.message);
                refinedText = fallbackText;
            }

            if (!refinedText) {
                refinedText = fallbackText;
            }

            return res.json({
                success: true,
                message: 'Job description refined successfully',
                data: {
                    refinedDescription: refinedText
                }
            });
        } catch (error) {
            console.error('Refine Job Description API Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to refine job description with AI'
            });
        }
    }
}

module.exports = AIController;

