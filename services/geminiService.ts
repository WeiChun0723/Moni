
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Transaction } from "../types";

export const extractTransactionsFromStatement = async (
  base64Data: string,
  mimeType: string
): Promise<Partial<Transaction>[]> => {
  // Use gemini-3-pro-preview for complex document analysis
  const model = 'gemini-3-pro-preview';
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are a professional financial data extractor. 
    Analyze the provided document image or PDF.
    Your goal is to identify and extract every single financial transaction.
    
    Rules for extraction:
    1. Output MUST be a valid JSON array of objects.
    2. Each object MUST have these fields:
       - date: String (YYYY-MM-DD). If year is missing, assume the current year.
       - description: String (Vendor name or transaction purpose).
       - amount: Number (Absolute positive value).
       - type: 'expense' or 'income'. Look for signs of credit/debit.
       - category: One of [Rent, Savings, Shop, Fun, Food, Transport, Income, Other].
    
    Context:
    - If the document is an eWallet statement (like TNG eWallet), be extra careful to distinguish between 'Transfer' and 'Payment'.
    - If a category is ambiguous, use 'Other'.
    - Ignore summary totals, only extract individual line items.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: "Extract all transactions from this financial statement as JSON." }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        // Adding thinkingBudget for complex reasoning tasks on gemini-3-pro-preview
        thinkingConfig: { thinkingBudget: 4000 },
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

    const text = response.text;
    if (!text) return [];
    
    // Sometimes response.text might contain markdown blocks if responseMimeType is not strictly enforced by the model version
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error: any) {
    console.error("Gemini extraction error:", error);
    throw new Error("AI failed to read document. Check file quality or try a different format.");
  }
};
