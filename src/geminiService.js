import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export async function askGemini(prompt) {
  // Graceful fallback if no key is configured
  if (!apiKey || apiKey === "your-gemini-api-key") {
    const mockResponses = {
      "weather": "You can check the weather for any district in Odisha by clicking on the 'Weather Alerts' button on the dashboard.",
      "fertilizer": "For rice, a mix of Nitrogen, Phosphorus, and Potassium is recommended. For specific advice, please select the crop in the 'Crop Manager' section.",
      "rice": "Rice grows best in clayey and loamy soils. It needs regular watering and is typically harvested in 90-120 days. Check the Crop Manager for more details.",
      "kalia": "The KALIA scheme provides financial aid to farmers in Odisha for cultivation and livelihood. You can find more details in the 'Govt Schemes' section.",
      "loan": "You can calculate your loan EMI using the 'Loan EMI Calculator' in the 'Finance Manager'.",
      "profit": "To calculate your profit, go to the 'Finance Manager' and use the 'Profit Calculator' tab.",
      "default": "I can answer questions about weather, fertilizer, loans, profits, and schemes like KALIA. Please try asking one of those. (To enable real AI, set VITE_GEMINI_API_KEY in your .env file!)"
    };

    const msg = prompt.toLowerCase();
    for (const keyword in mockResponses) {
      if (msg.includes(keyword)) {
        return mockResponses[keyword];
      }
    }
    return mockResponses['default'];
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the latest standard model gemini-1.5-flash or gemini-2.5-flash (if supported). Let's use gemini-1.5-flash for max compatibility.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(
      `You are CropGPT, a helpful and knowledgeable agricultural AI assistant. You support farmers from Odisha with crop management, weather, government schemes, and financial guidance. Keep your answers brief, actionable, and friendly.
      
      User's question: ${prompt}`
    );
    return result.response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return `AI Assistant Error: ${error.message}. Please verify your VITE_GEMINI_API_KEY.`;
  }
}
