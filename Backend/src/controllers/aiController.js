import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper to get Gemini Model
const getModel = () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

// --- FEATURE 1: AI CODE FIXER ---
export const fixCode = async (req, res) => {
    const { code, error, language } = req.body;
    console.log(`🤖 AI fixing ${language} error...`);

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "API Key missing" });
    }

    try {
        const model = getModel();
        const prompt = `Fix this ${language} code. Error: ${error}\nCode: ${code}\nReturn ONLY JSON: {"explanation": "...", "fixedCode": "..."}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json|```/g, "").trim();

        res.json(JSON.parse(cleanJson));
    } catch (err) {
        console.error("Fix Error:", err);
        res.status(500).json({ error: "AI Fix failed" });
    }
};

