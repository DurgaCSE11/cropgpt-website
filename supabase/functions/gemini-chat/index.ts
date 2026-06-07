import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()

    // Dynamically load keys cropgpt1, cropgpt2, cropgpt3 ... up to cropgpt20
    const apiKeys = [];
    for (let i = 1; i <= 20; i++) {
      const key = Deno.env.get(`cropgpt${i}`) || Deno.env.get(`CROPGPT${i}`);
      if (key) {
        apiKeys.push(key);
      }
    }

    if (apiKeys.length === 0) {
      throw new Error("No Gemini API Keys (cropgpt1/CROPGPT1, etc.) set in Supabase Secrets.")
    }

    // Shuffle the keys randomly to distribute the query load evenly.
    // This prevents any single key from getting exhausted/rate-limited first.
    const shuffledKeys = apiKeys.sort(() => Math.random() - 0.5);

    // 2. Models to try in priority order
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];
    let responseText = "";
    let lastError = null;

    // Loop through the randomized keys
    for (const key of shuffledKeys) {
      try {
        const genAI = new GoogleGenerativeAI(key);

        // Try models in sequence for the current key
        for (const modelName of models) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const isJsonPrompt = prompt.toLowerCase().includes("json") || prompt.toLowerCase().includes("array") || prompt.toLowerCase().includes("format");
            const finalPrompt = isJsonPrompt ? prompt : `You are CropGPT, a helpful and knowledgeable agricultural AI assistant. You support farmers from Odisha with crop management, weather, government schemes, and financial guidance. Keep your answers brief, actionable, and friendly.
              
              User's question: ${prompt}`;

            const result = await model.generateContent(finalPrompt);
            responseText = result.response.text();
            if (responseText) break; // Success!
          } catch (modelErr) {
            console.warn(`Model ${modelName} failed with current key:`, modelErr.message);
            lastError = modelErr;
          }
        }

        if (responseText) break; // Success!
      } catch (keyErr) {
        console.warn("API Key failed, switching to next key:", keyErr.message);
        lastError = keyErr;
      }
    }

    if (!responseText) {
      throw new Error(`All keys and models failed. Last error: ${lastError?.message}`);
    }

    return new Response(
      JSON.stringify({ text: responseText }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
