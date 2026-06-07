import { supabase } from './supabaseClient';

export async function askGemini(prompt, language = 'English') {
  // Local keyword-based response fallback in multiple languages
  const getMockResponse = (msgPrompt) => {
    const mockResponses = {
      English: {
        "weather": "You can check the weather for any district in Odisha by clicking on the 'Weather Alerts' button on the dashboard.",
        "fertilizer": "For rice, a mix of Nitrogen, Phosphorus, and Potassium is recommended. For specific advice, please select the crop in the 'Crop Manager' section.",
        "rice": "Rice grows best in clayey and loamy soils. It needs regular watering and is typically harvested in 90-120 days. Check the Crop Manager for more details.",
        "kalia": "The KALIA scheme provides financial aid to farmers in Odisha for cultivation and livelihood. You can find more details in the 'Govt Schemes' section.",
        "loan": "You can calculate your loan EMI using the 'Loan EMI Calculator' in the 'Finance Manager'.",
        "profit": "To calculate your profit, go to the 'Finance Manager' and use the 'Profit Calculator' tab.",
        "default": "I can answer questions about weather, fertilizer, loans, profits, and schemes like KALIA. Please try asking one of those. (Deploy Supabase Edge Function 'gemini-chat' to enable real AI!)"
      },
      Hindi: {
        "weather": "आप डैशबोर्ड पर 'मौसम अलर्ट' बटन पर क्लिक करके ओडिशा के किसी भी जिले के मौसम की जांच कर सकते हैं।",
        "fertilizer": "चावल के लिए नाइट्रोजन, फास्फोरस और पोटेशियम के मिश्रण की सिफारिश की जाती है। विशिष्ट सलाह के लिए, कृपया 'फसल प्रबंधक' अनुभाग में फसल का चयन करें।",
        "rice": "चावल मिट्टी और दोमट मिट्टी में सबसे अच्छा बढ़ता है। इसे नियमित पानी की आवश्यकता होती है और आमतौर पर रोपण के 90-120 दिनों के बाद काटा जाता है। अधिक जानकारी के लिए फसल प्रबंधक की जाँच करें।",
        "kalia": "कालिया योजना ओडिशा में किसानों को खेती और आजीविका के लिए वित्तीय सहायता प्रदान करती है। आप 'सरकारी योजनाएं' अनुभाग में अधिक विवरण पा सकते हैं।",
        "loan": "आप 'वित्त प्रबंधक' में 'ऋण ईएमआई कैलकुलेटर' का उपयोग करके अपने ऋण ईएमआई की गणना कर सकते हैं।",
        "profit": "अपने लाभ की गणना करने के लिए, 'वित्त प्रबंधक' पर जाएं और 'लाभ कैलकुलेटर' टैब का उपयोग करें।",
        "default": "मैं मौसम, उर्वरक, ऋण, लाभ और कालिया जैसी योजनाओं के बारे में प्रश्नों के उत्तर दे सकता हूँ। कृपया इनमें से कोई एक पूछने का प्रयास करें।"
      },
      Odia: {
        "weather": "ଆପଣ ଡ୍ୟାସବୋର୍ଡରେ 'ପାଣିପାଗ ସୂଚନା' ବଟନ ଉପରେ କ୍ଲିକ୍ କରି ଓଡ଼ିଶାର ଯେକୌଣସି ଜିଲ୍ଲାର ପାଣିପାଗ ଯାଞ୍ଚ କରିପାରିବେ।",
        "fertilizer": "ଧାନ ପାଇଁ ନାଇଟ୍ରୋଜେନ୍, ଫସଫରସ୍ ଏବଂ ପୋଟାସିୟମ୍ ର ମିଶ୍ରଣ ସୁପାରିଶ କରାଯାଏ | ନିର୍ଦ୍ଦିଷ୍ଟ ପରାମର୍ଶ ପାଇଁ, ଦୟାକରି 'ଫସଲ ପରିଚାଳକ' ବିଭାଗରେ ଫସଲ ଚୟନ କରନ୍ତୁ |",
        "rice": "ଧାନ ମାଟି ଏବଂ ଦୋମଟା ମାଟିରେ ଭଲ ବଢିଥାଏ | ଏହାକୁ ନିୟମିତ ପାଣି ଦେବା ଆବଶ୍ୟକ ଏବଂ ସାଧାରଣତଃ ରୋପଣର ୯୦-୧ଉଠି ଦିନ ପରେ ଅମଳ କରାଯାଏ | ଅଧିକ ସୂଚନା ପାଇଁ ଫସଲ ପରିଚାଳକ ଯାଞ୍ଚ କରନ୍ତୁ |",
        "kalia": "କାଳିଆ ଯୋଜନା ଓଡ଼ିଶାର ଚାଷୀଙ୍କୁ ଚାଷ ଏବଂ ଜୀବିକା ପାଇଁ ଆର୍ଥିକ ସହାୟତା ପ୍ରଦାନ କରିଥାଏ। ଆପଣ 'ସରକାରୀ ଯୋଜନା' ବିଭାଗରେ ଅଧିକ ସୂଚନା ପାଇପାରିବେ।",
        "loan": "ଆପଣ 'ଆର୍ଥିକ ପରିଚାଳକ' ରେ 'ଋଣ EMI କାଲକୁଲେଟର' ବ୍ୟବହାର କରି ଆପଣଙ୍କର ଋଣ EMI ହିସାବ କରିପାରିବେ |",
        "profit": "ଆପଣଙ୍କର ଲାଭ ହିସାବ କରିବାକୁ, 'ଆର୍ଥିକ ପରିଚାଳକ' କୁ ଯାଆନ୍ତୁ ଏବଂ 'ଲାଭ କାଲକୁଲେଟର' ଟ୍ୟାବ୍ ବ୍ୟବହାର କରନ୍ତୁ |",
        "default": "ମୁଁ ପାଣିପାଗ, ସାର, ଋଣ, ଲାଭ ଏବଂ କାଳିଆ ଭଳି ଯୋଜନା ବିଷୟରେ ପ୍ରଶ୍ନର ଉତ୍ତର ଦେଇପାରିବି | ଦୟାକରି ଏଥିମଧ୍ୟରୁ ଗୋଟିଏ ପଚାରିବାକୁ ଚେଷ୍ଟା କରନ୍ତୁ |"
      }
    };

    const langResponses = mockResponses[language] || mockResponses.English;
    const msg = msgPrompt.toLowerCase();
    for (const keyword in langResponses) {
      if (msg.includes(keyword)) {
        return langResponses[keyword];
      }
    }
    return langResponses['default'];
  };

  const finalPrompt = `${prompt} \n\nIMPORTANT: You must write the entire response output in the "${language}" language. If returning a JSON structure, translate the text values inside the JSON attributes into ${language} while keeping the keys/structure intact.`;

  // 1. Try invoking the Supabase Edge Function first
  try {
    const { data, error } = await supabase.functions.invoke('gemini-chat', {
      body: { prompt: finalPrompt }
    });

    if (!error && data && data.text) {
      return data.text;
    }
    if (error) console.warn("Supabase Edge Function returned error:", error.message);
  } catch (error) {
    console.warn("Supabase Edge Function invocation failed:", error.message);
  }

  // 2. Fall back to Direct client-side API call if VITE_GEMINI_API_KEY is configured
  const directApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const hasDirectKey = directApiKey && directApiKey !== 'your-gemini-api-key' && directApiKey.trim() !== '';

  if (hasDirectKey) {
    try {
      console.log("Edge Function failed. Invoking Gemini API directly from client...");
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${directApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }]
        })
      });
      const result = await response.json();
      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        return result.candidates[0].content.parts[0].text;
      }
      console.warn("Direct Gemini call returned invalid response:", result);
    } catch (directErr) {
      console.warn("Direct Gemini call failed:", directErr.message);
    }
  }

  // 3. Fall back to client-side mock keywords response
  return getMockResponse(prompt);
}
