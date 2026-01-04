import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI client using process.env.API_KEY exclusively as per guidelines.
// Assume process.env.API_KEY is pre-configured, valid, and accessible.
// Cast process.env to any to satisfy tsc build without needing @types/node
const apiKey = (process.env as any).API_KEY;
const ai = new GoogleGenAI({ apiKey });

export async function getMotivationalQuote(stats: { 
  completionRate: number, 
  activityCount: number, 
  monthName: string 
}) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User tracked ${stats.activityCount} habits in ${stats.monthName}. 
      Completion rate: ${stats.completionRate}%.
      Generate a simple, warm, and very encouraging sentence to keep them going. 
      Use easy words, no jargon, max 10 words.`,
      config: { temperature: 0.9 }
    });
    // Extract the generated text using the .text property (not a method).
    return response.text?.trim() || "You're doing great! Every small step counts today.";
  } catch (error) {
    return "Keep going! You are doing a wonderful job.";
  }
}

export async function getMonthlyInsights(data: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Look at this habit data and find 3 simple patterns. 
      Use very friendly, easy-to-understand words. 
      Format as a short JSON list of 3 strings.
      Data: ${data}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });
    // Extract the generated text using the .text property.
    const text = response.text;
    return JSON.parse(text || "[]");
  } catch (error) {
    return ["You're doing amazing on weekdays!", "Weekends are a good time to rest and reset.", "You never miss your morning habits!"];
  }
}
