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

export const generateMacroscopyAnalysis = async (record: any): Promise<string> => {
  if (!openai) {
    return "Erro: OpenAI não configurada.";
  }

  try {
    const prompt = `
        Atue como um Patologista Veterinário. Crie um laudo macroscópico e uma SUGESTÃO de microscopia com base nos dados abaixo.
        
        DADOS DO EXAME:
        ${JSON.stringify(record, null, 2)}
        
        Siga ESTRITAMENTE este modelo de saída (mantenha os títulos):

        Natureza do material conforme requisição:
        [Inferir tipo de tecido/lesão, ex: "Formação cutânea em local não informado" ou basear-se no nome do exame/paciente]

        Descrição macroscópica:
        [Texto corrido formal descrevendo o recebimento. Ex: "Recebido(s) um (01) frasco(s) contendo...". Incluir medidas, cor, consistência, aspecto ao corte. Mencionar cassetes.]

        Coloração:
        Hematoxilina e eosina

        Descrição microscópica:
        [Crie uma descrição microscópica PLAUSÍVEL e TÉCNICA compatível com a macroscopia. Se for um nódulo enegrecido, descreva características de melanoma. Se for cístico, descreva cisto. Use terminologia técnica avançada: "proliferação neoplásica", "células fusiformes", "pleomorfismo", "índice mitótico", etc. Se não for possível inferir, crie uma descrição genérica de "Dermatite" ou "Processo inflamatório".]
        
        Diagnóstico:
        [Sugira um diagnóstico compatível]
        
        Nota:
        [Adicione nota se margens estiverem comprometidas ou se houver observações relevantes]
        `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use a better model for text generation
      messages: [
        { role: "system", content: "Você é um especialista em Patologia Veterinária." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
    });

    return response.choices[0].message.content || "Erro ao gerar análise.";

  } catch (error) {
    console.error("Error generating analysis:", error);
    return "Erro ao gerar análise: " + String(error);
  }
};
