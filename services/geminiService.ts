
import { GoogleGenAI } from "@google/genai";

export const generateAiResponse = async (
  userMessage: string, 
  persona: string, 
  history: {role: 'user' | 'model', parts: {text: string}[]}[] = []
) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined') {
    return "Nota: Para usar a IA diretamente no chat, configure a API_KEY. No momento, o motor backend é recomendado para automações.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: `Persona: ${persona}. Responda em Português, de forma curta e profissional.`,
        temperature: 0.7,
      },
    });

    return response.text || "Sem resposta da IA.";
  } catch (error) {
    console.error("Gemini Frontend Error:", error);
    return "Ocorreu um erro na comunicação com o Gemini.";
  }
};
