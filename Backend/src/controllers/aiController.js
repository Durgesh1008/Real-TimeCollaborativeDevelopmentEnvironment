import Groq from "groq-sdk";

// Initialize Groq with the key from your Render Env
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const fixCode = async (req, res) => {
    const { code, error, language } = req.body;

    console.log(`🤖 Groq AI fixing ${language} error...`);

    // Safety check for the API key
    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "Server Error: GROQ_API_KEY is missing." });
    }

    try {
        const prompt = `You are an expert developer. Fix this ${language} code.
        Error Message: ${error || "Unknown error"}
        Code to fix:
        ${code}

        IMPORTANT: Return ONLY a valid JSON object. No markdown, no backticks.
        JSON Structure: {"explanation": "...", "fixedCode": "..."}`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile", // This model is extremely fast and free
            response_format: { type: "json_object" }, // This FORCES Groq to send valid JSON
        });

        // Groq sends the answer inside 'content'
        const rawContent = completion.choices[0].message.content;
        const data = JSON.parse(rawContent);

        res.status(200).json(data);

    } catch (err) {
        console.error("❌ Groq Error:", err);
        res.status(500).json({
            error: err.message || "An error occurred while processing the AI request.",
            message: err.message, 
            stack: err.stack
        });
    }
};