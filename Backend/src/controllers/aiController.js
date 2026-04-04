import { GoogleGenerativeAI } from "@google/generative-ai";

const getModel = () => {
    // Ensure the key exists
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const fixCode = async (req, res) => {
    const { code, error, language } = req.body;

    console.log(`🤖 AI processing request for: ${language}`);

    try {
        const model = getModel();

        // Detailed prompt to force valid JSON
        const prompt = `You are an expert developer. Fix the following ${language} code.
        Error Message: ${error || "Unknown error"}
        Code:
        ${code}

        INSTRUCTIONS:
        1. Explain the fix briefly.
        2. Provide the full corrected code.
        3. Respond ONLY with a valid JSON object. 
        4. Do NOT use markdown formatting or backticks.
        
        JSON Format:
        {"explanation": "...", "fixedCode": "..."}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 1. Clean the response (remove markdown if Gemini adds it)
        const cleanJson = text.replace(/```json|```/g, "").trim();

        // 2. Safely parse JSON
        try {
            const data = JSON.parse(cleanJson);
            return res.status(200).json(data);
        } catch (parseError) {
            console.error("JSON Parse Error. Raw Text:", text);
            // Fallback response if AI fails to format JSON correctly
            return res.status(200).json({
                explanation: "I found a fix, but the formatting was slightly off.",
                fixedCode: cleanJson
            });
        }

    } catch (err) {
        console.error("❌ AI Controller Error:", err.message);

        // Check for specific Gemini errors (like location restrictions)
        if (err.message.includes("location") || err.message.includes("supported")) {
            return res.status(500).json({
                error: "AI Fix failed",
                message: "This AI model is not supported in the server's current region (Render Free Tier restriction)."
            });
        }

        res.status(500).json({
            error: "AI Fix failed",
            message: err.message
        });
    }
};