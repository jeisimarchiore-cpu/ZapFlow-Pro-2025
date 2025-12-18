
import { GoogleGenAI } from "@google/genai";

export const generateAiResponse = async (
  userMessage: string, 
  persona: string, 
  history: {role: 'user' | 'model', parts: {text: string}[]}[] = []
) => {
  // Always use process.env.API_KEY directly for initialization as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: `You are an AI assistant representing a brand. 
        Persona Profile: ${persona}. 
        Keep responses concise, professional, and helpful. Always respond in Portuguese as the primary language unless the user speaks another.`,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    // Access .text property directly instead of calling it as a method
    return response.text || "Desculpe, não consegui processar sua mensagem agora.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ocorreu um erro ao falar com a IA.";
  }
};
