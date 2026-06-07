import { supabase } from './supabaseClient';

export async function askGemini(prompt, language = 'English') {
  // Local keyword-based response fallback if Supabase Edge Function is not deployed or fails
  const getMockResponse = (msgPrompt) => {
    const mockResponses = {
      "weather": "You can check the weather for any district in Odisha by clicking on the 'Weather Alerts' button on the dashboard.",
      "fertilizer": "For rice, a mix of Nitrogen, Phosphorus, and Potassium is recommended. For specific advice, please select the crop in the 'Crop Manager' section.",
      "rice": "Rice grows best in clayey and loamy soils. It needs regular watering and is typically harvested in 90-120 days. Check the Crop Manager for more details.",
      "kalia": "The KALIA scheme provides financial aid to farmers in Odisha for cultivation and livelihood. You can find more details in the 'Govt Schemes' section.",
      "loan": "You can calculate your loan EMI using the 'Loan EMI Calculator' in the 'Finance Manager'.",
      "profit": "To calculate your profit, go to the 'Finance Manager' and use the 'Profit Calculator' tab.",
      "default": "I can answer questions about weather, fertilizer, loans, profits, and schemes like KALIA. Please try asking one of those. (Deploy Supabase Edge Function 'gemini-chat' to enable real AI!)"
    };

    const msg = msgPrompt.toLowerCase();
    for (const keyword in mockResponses) {
      if (msg.includes(keyword)) {
        return mockResponses[keyword];
      }
    }
    return mockResponses['default'];
  };

  try {
    // Invoke the Supabase Edge Function securely (no keys leaked on client)
    const { data, error } = await supabase.functions.invoke('gemini-chat', {
      body: { 
        prompt: `${prompt} \n\nIMPORTANT: You must write the entire response output in the "${language}" language. If returning a JSON structure, translate the text values inside the JSON attributes into ${language} while keeping the keys/structure intact.`
      }
    });

    if (error) throw error;
    if (data && data.text) {
      return data.text;
    }
    
    return getMockResponse(prompt);
  } catch (error) {
    console.warn("Supabase Edge Function failed or not deployed. Running client-side keywords fallback:", error.message);
    return getMockResponse(prompt);
  }
}
