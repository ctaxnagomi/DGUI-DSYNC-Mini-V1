import { GoogleGenAI, Type } from "@google/genai";
import { PresentationData } from "./utils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeContent(
  url: string, 
  settings: { length: string; density: string; tone: string; language: string },
  engine: string
): Promise<PresentationData> {
  const prompt = `
    Analyze the following content from URL: ${url}
    Using Engine: ${engine}
    Generate a presentation structure based on these settings:
    - Length: ${settings.length} (Target between 15 and 35 slides)
    - Density: ${settings.density}
    - Tone: ${settings.tone}
    - Language: ${settings.language} (If 'Bahasa Malaysia', ensure all content is in Bahasa Malaysia)

    CRITICAL: You MUST generate at least 15 slides and no more than 35 slides.
    The response must be a structured JSON object.
  `;

  try {
    // For now, we use Gemini as the primary orchestrator for all engines
    // In a production environment, we would switch between different SDKs here
    // e.g., if (engine === 'Qwen') { ... }
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.ARRAY, items: { type: Type.STRING } },
                  imagePrompt: { type: Type.STRING }
                },
                required: ["title", "content"]
              },
              minItems: 15,
              maxItems: 35
            }
          },
          required: ["title", "summary", "slides"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text) as PresentationData;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to analyze content. Please check the URL or try again.");
  }
}

export async function analyzeImageConfig(base64Image: string, engine: string): Promise<any> {
  const prompt = `
    Analyze this image and extract key design details for a presentation application.
    Using Engine: ${engine}
    Return a JSON object with:
    - suggestedTheme: { name, primaryColor, accentColor, font }
    - suggestedSettings: { tone, density }
    - description: A brief summary of the visual style.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Image.split(",")[1] || base64Image
          }
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return null;
  }
}
