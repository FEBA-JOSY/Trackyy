
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      Avoid technical terms like 'consistency' or 'frequency'. 
      Instead, use words like 'great job', 'keep it up', or 'try this'.
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
    const text = response.text;
    return JSON.parse(text || "[]");
  } catch (error) {
    return ["You're doing amazing on weekdays!", "Weekends are a good time to rest and reset.", "You never miss your morning habits!"];
  }
}
