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



// Helper to generate for a single jar
const generateForJar = async (patientInfo: any, jar: any): Promise<any> => {
  if (!openai) throw new Error("OpenAI not initialized");

  // Sanitize jar object to avoid sending deep nested relations or unnecessary heavy data if any
  const jarContext = {
    numero: jar.numero,
    fragments: jar.fragments // Assuming fragments contains the relevant descriptions
  };

  const prompt = `
        Atue como um Patologista Veterinário. Crie um laudo completo (Anatomopatológico) APENAS para o MATERIAL descrito abaixo (Frasco ${jar.numero}).
        
        IMPORTANTE: 
        1. Ignore qualquer informação de outros frascos. Foco total neste frasco.
        2. Se houver múltiplos fragmentos neste frasco, descreva-os em conjunto na macroscopia/microscopia deste frasco.
        3. Não mencione "Frasco ${jar.numero}" no texto da Macroscopia, inicie a descrição diretamente.
        
        PACIENTE: ${JSON.stringify(patientInfo)}
        
        MATERIAL PARA ANÁLISE (FRASCO ${jar.numero}):
        ${JSON.stringify(jarContext, null, 2)}
        
        Siga ESTRITAMENTE este modelo JSON de saída. Não retorne markdown, apenas JSON.
        
        {
            "jar_numero": "${jar.numero}",
            "natureza": "[Inferir, ex: Formação cutânea]",
            "macroscopia": "[Texto técnico formal descrevendo a macroscopia APENAS deste frasco]",
            "coloracao": "Hematoxilina e eosina",
            "microscopia": "[Descrição microscópica técnica para este material]",
            "diagnostico": "[Diagnóstico conclusivo para este frasco]",
            "observacao": "...",
            "nota": "...",
            "referencia": "..."
        }
        `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Você é um especialista em Patologia Veterinária. Retorne apenas JSON válido." },
      { role: "user", content: prompt }
    ],
    temperature: 0.5,
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  return content ? JSON.parse(content) : null;
};

export const generateMacroscopyAnalysis = async (record: any): Promise<any> => {
  if (!openai) {
    throw new Error("OpenAI não configurada.");
  }

  try {
    const patientInfo = {
      numero_guia: record.numero_guia,
      nome_paciente: record.nome_paciente,
      especie: record.especie // if available
    };

    const jars = record.jars || [];

    // If no jars, maybe try to process whole record? But assumption is jars exist.
    if (jars.length === 0) return [];

    // Parallel execution for all jars
    console.log(`Generating reports for ${jars.length} jars...`);
    const reports = await Promise.all(jars.map((jar: any) => generateForJar(patientInfo, jar)));

    return reports;

  } catch (error) {
    console.error("Error generating analysis:", error);
    throw error;
  }
};

export const generateMammaryAnalysis = async (record: any): Promise<any> => {
  if (!openai) throw new Error("OpenAI not initialized");

  try {
    const patientInfo = {
      id: record.numero_guia,
      paciente: record.nome_paciente,
      idade: record.idade
    };

    const technicalData = {
      tipo_especime: record.tipo_especime,
      lateralidade: record.lateralidade,
      localizacao: record.localizacao,
      quantidade_frascos: record.quantidade_frascos,
      volume: record.volume,
      medidas_especime: record.medida_completa || record.dimensoes,
      nodulo_principal: {
        medida: record.medida_nodulo,
        aparencia: record.aparencia_nodulo,
        consistencia: record.consistencia_nodulo,
        aspecto: record.aspecto_nodulo,
        cor: record.cor_nodulo
      },
      linfonodo: record.linfonodo ? {
        presente: true,
        medida: record.medida_linfonodo
      } : "Não informado ou ausente",
      cassetes: record.cassettes,
      representacao: record.representacao
    };

    const prompt = `
        Atue como um Patologista Veterinário Sênior. Gere um laudo completo de Patologia Mamária.
        
        CONTEXTO DO PDF EXEMPLO:
        - "Descrição macroscópica": Deve ser detalhada, mencionando número de frascos, tipo de mastectomia, medidas, descrição dos nódulos (M.5 maior/menor se houver), aspecto ao corte, consistência, cor, margens e linfonodos.
        - "Descrição microscópica": Texto técnico denso, descrevendo arquitetura, tipo celular, atipias, mitoses, invasão linfática/vascular, margens, necrose, inflamação, etc.
        - "Diagnóstico / Conclusão": Lista de diagnósticos (ex: Carcinoma, Mastocitoma, Metástase).
        - "Observação": Notas sobre prognóstico, margens ou invasão.
        - "Nota" e "Referência": Citações bibliográficas padrão (ex: AFIP, Goldschmidt).

        DADOS DO CASO:
        PACIENTE: ${JSON.stringify(patientInfo)}
        DADOS TÉCNICOS: ${JSON.stringify(technicalData, null, 2)}

        INSTRUÇÕES:
        1. Baseie-se nos dados técnicos fornecidos para construir a Macroscopia. 
           - Se "tipo_especime" for "Mastectomia...", descreva de acordo.
           - Use as medidas e atributos do nódulo para descrever a lesão principal.
           - Mencione a representação em cassetes/blocos (soma_blocos ou lista de cassetes).
        2. Para a Microscopia e Diagnóstico, como NÃO temos imagens reais, GERE UM CASO HIPOTÉTICO COERENTE com os dados macroscópicos (Simulação de Análise).
           - Se o nódulo é "Irregular, Ulcerado", sugira malignidade (ex: Carcinoma).
           - Se é "Bem delimitado, livre", sugira benignidade (ex: Adenoma) ou baixo grau.
           - Crie uma descrição microscópica rica compatível com o diagnóstico sugerido.

        SAÍDA JSON (Estritamente este formato):
        {
            "aspecto_macroscopico": "Texto completo da macroscopia...",
            "microscopia": "Texto completo da microscopia...",
            "diagnostico": "Texto do diagnóstico...",
            "nota": "Texto da nota padrão...",
            "referencias": "Texto das referências bibliográficas..."
        }
        `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Você é um especialista em Patologia Veterinária (Mamária). Retorne apenas JSON válido." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    return content ? JSON.parse(content) : null;

  } catch (error) {
    console.error("Error generating mammary analysis:", error);
    throw error;
  }
};
