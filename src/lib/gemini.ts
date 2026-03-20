import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PresentationData } from "./utils";
import { VoiceSettings } from "../VoiceRecorder";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeContent(
  url: string, 
  settings: { length: string; density: string; tone: string; language: string },
  engine: string,
  additionalContext?: string
): Promise<PresentationData> {
  const prompt = `
    DEEP ANALYSIS REQUEST:
    You are an expert content analyst and presentation architect. 
    Your task is to analyze the content at this URL: ${url}
    
    ${additionalContext ? `USER-PROVIDED CONTEXT: ${additionalContext}` : ""}
    
    INSTRUCTIONS FOR ACCURACY & STRUCTURE:
    1. CONTENT ACQUISITION: If this is a YouTube URL, you MUST use your tools (urlContext and googleSearch) to find the video transcript, detailed description, and key takeaways. If urlContext fails to provide a transcript, you MUST use googleSearch to find the transcript or a detailed summary of this specific video.
    2. ANALYSIS & SUMMARY: Use LLM processing to identify core concepts and main talking points. Skip irrelevant content.
    3. LOGICAL STRUCTURING: Break the summary into logical sections (Introduction, Main Points, Conclusion) suitable for a slide deck.
    4. SLIDE GENERATION: Automatically generate an outline with titles, bullet points, and speaker notes based on the transcript.
    5. VISUAL SUGGESTION: Suggest specific image prompts that complement the text on each slide.
    6. STICK STRICTLY TO THE CONTENT OF THE PROVIDED URL. Do not hallucinate or use previous context.
    7. If 'USER-PROVIDED CONTEXT' is present, use it to guide your focus, but the URL content remains the primary source of truth.
    8. VERIFICATION: Before generating the JSON, verify that the content you've extracted matches the URL's actual topic (e.g., if it's a cooking video, ensure the slides are about cooking, not football).

    PRESENTATION SETTINGS:
    - Engine: ${engine}
    - Length: ${settings.length} (Target 15-35 slides)
    - Density: ${settings.density}
    - Tone: ${settings.tone}
    - Language: ${settings.language} (If 'Bahasa Malaysia', translate ALL content accurately)

    OUTPUT REQUIREMENTS:
    - Generate a structured JSON object.
    - Ensure each slide has a clear, professional title, detailed bullet points, and comprehensive speaker notes.
    - The content must be highly accurate and directly derived from the source material.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        tools: [{ urlContext: {} }, { googleSearch: {} }],
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
                  imagePrompt: { type: Type.STRING },
                  speakerNotes: { type: Type.STRING }
                },
                required: ["title", "content", "speakerNotes"]
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

export async function generateNarration(text: string, voiceSettings: VoiceSettings): Promise<string> {
  try {
    const voiceName = voiceSettings.model === 'female' ? 'Kore' : 'Zephyr';
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Failed to generate audio");
    
    return base64Audio;
  } catch (error) {
    console.error("Narration Error:", error);
    throw error;
  }
}

export async function generateImage(
  prompt: string, 
  aspectRatio: string = "16:9", 
  imageSize: string = "1K"
): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
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
