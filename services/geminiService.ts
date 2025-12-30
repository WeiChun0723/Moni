
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const extractTransactionsFromStatement = async (
  base64Data: string,
  mimeType: string
): Promise<Partial<Transaction>[]> => {
  const model = 'gemini-3-flash-preview';

  const prompt = `
    Analyze this bank statement or receipt image. 
    Extract all individual transactions. 
    For each transaction, identify:
    - Date (in YYYY-MM-DD format)
    - Description
    - Amount (as a positive number)
    - Transaction Type (income or expense)
    - Category (Assign one of: Food, Transport, Housing, Entertainment, Utilities, Shopping, Health, Income, Other)

    Return a JSON array of transaction objects.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING, enum: ['income', 'expense'] },
            category: { type: Type.STRING }
          },
          required: ['date', 'description', 'amount', 'type', 'category']
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return [];
  }
};
