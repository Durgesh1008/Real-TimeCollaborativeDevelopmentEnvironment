import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the SDK outside the function to save resources
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const fixCode = async (req, res) => {
    const { code, error, language } = req.body;
    console.log(`🤖 AI processing request for: ${language}`);

    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "GEMINI_API_KEY is missing in backend env" });
        }

        // Using 'gemini-1.5-flash' is standard for the latest SDK
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are an expert developer. Fix this ${language} code.
        Error Message: ${error || "Unknown error"}
        Code:
        ${code}

        Return ONLY a valid JSON object with this structure:
        {"explanation": "short text", "fixedCode": "corrected code"}
        Do NOT include any markdown code blocks or backticks.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Remove any markdown like ```json or ``` if Gemini ignores instructions
        const cleanJson = text.replace(/```json|```/g, "").trim();

        try {
            const data = JSON.parse(cleanJson);
            res.status(200).json(data);
        } catch (parseErr) {
            console.error("AI returned invalid JSON, sending raw text as fallback.");
            res.status(200).json({
                explanation: "I found a fix, but had trouble formatting it.",
                fixedCode: cleanJson
            });
        }

    } catch (err) {
        console.error("❌ AI Controller Error:", err.message);
        res.status(500).json({
            error: "AI Fix failed",
            message: err.message
        });
    }
};