import OpenAI from 'openai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

let openai: OpenAI | null = null;

if (apiKey) {
  openai = new OpenAI({
    apiKey: apiKey,
  });
} else {
  console.warn("OPENAI_API_KEY is not set. AI categorization will not work.");
}

export const categorizeInput = async (input: string): Promise<{ category: string; confidence: number }> => {
  if (!openai) {
    console.warn("OpenAI client not initialized.");
    // Fallback or error
    return { category: "Uncategorized", confidence: 0 };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective model
      messages: [
        {
          role: "system",
          content: `You are an assistant that categorizes veterinary/pet-related inputs. 
          Categories: [Nutrition, Behavior, Medical, Appointment, General].
          Return JSON: { "category": "String", "confidence": Number (0-1) }`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content from OpenAI");

    const result = JSON.parse(content);
    return {
        category: result.category || "Uncategorized",
        confidence: result.confidence || 0
    };

  } catch (error) {
    console.error("Error categorizing input:", error);
    return { category: "Error", confidence: 0 };
  }
};
