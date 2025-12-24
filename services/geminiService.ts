
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionTemplate } from "../types";

export const analyzeImageToJson = async (
  base64Image: string,
  mimeType: string,
  template: ExtractionTemplate,
  customPrompt?: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let systemInstruction = "You are a specialized data extraction AI. Your goal is to analyze an image and return strictly valid JSON. Do not include markdown formatting like ```json ... ```, just the raw JSON string.";
  
  const templatePrompts: Record<ExtractionTemplate, string> = {
    [ExtractionTemplate.GENERAL]: "Generate a comprehensive JSON object describing everything in this image, including objects, colors, lighting, and mood.",
    [ExtractionTemplate.INVOICE]: "Extract all data from this invoice/receipt into JSON. Include vendor, date, total, tax, and an array of line items with description and price.",
    [ExtractionTemplate.RECIPE]: "Extract the recipe from this image into JSON. Include title, prepTime, cookTime, ingredients (with amounts), and step-by-step instructions.",
    [ExtractionTemplate.BUSINESS_CARD]: "Extract contact information from this business card into JSON. Include name, jobTitle, company, email, phone, website, and address.",
    [ExtractionTemplate.PRODUCT]: "Analyze this product image and generate e-commerce metadata in JSON. Include name, category, detected_features, dominant_colors, and potential_tags.",
    [ExtractionTemplate.OCR]: "Perform OCR on this image and return the text structured in JSON by layout blocks, lines, and raw_text.",
    [ExtractionTemplate.CUSTOM]: customPrompt || "Analyze this image and return the requested data in JSON format."
  };

  const prompt = templatePrompts[template];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process image. Please ensure the image is clear and try again.");
  }
};
