import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "npm:@google/generative-ai"

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

    // 1. Gather all configured cropgpt key variables
    const apiKeys = [
      Deno.env.get('cropgpt1'),
      Deno.env.get('cropgpt2'),
      Deno.env.get('cropgpt3'),
      Deno.env.get('cropgpt4')
    ].filter(Boolean)

    if (apiKeys.length === 0) {
      throw new Error("No Gemini API Keys (cropgpt1, cropgpt2, etc.) set in Supabase Secrets.")
    }

    // 2. Models to try in priority order
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];
    let responseText = "";
    let lastError = null;

    // Try keys in sequence
    for (const key of apiKeys) {
      try {
        const genAI = new GoogleGenAI(key);

        // Try models in sequence for the current key
        for (const modelName of models) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(
              `You are CropGPT, a helpful and knowledgeable agricultural AI assistant. You support farmers from Odisha with crop management, weather, government schemes, and financial guidance. Keep your answers brief, actionable, and friendly.
              
              User's question: ${prompt}`
            );
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
