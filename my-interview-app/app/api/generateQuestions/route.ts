import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
    const { topic, numQuestions } = await req.json();

    // Validação de entrada
    if (!topic || !numQuestions) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 20) {
      return NextResponse.json({ error: "Número de perguntas inválido (1-20)" }, { status: 400 });
    }

    // Prompt melhorado
    const prompt = `Crie ${numQuestions} perguntas de entrevista sobre "${topic}" em inglês. As perguntas devem ser claras, concisas e relevantes para o tópico. Liste uma por linha e não inclua números ou marcadores.`;

    // Timeout para requisição
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 segundos

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
     // signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseText = completion.choices[0]?.message?.content?.trim();
    if (!responseText) {
      return NextResponse.json({ error: "Resposta inválida da OpenAI" }, { status: 500 });
    }

    // Limpeza das perguntas
    const questions = responseText
      .split("\n")
      .map(q => q.replace(/^\d+\.\s*/, "").trim()) // Remove números e marcadores
      .filter(q => q.length > 0); // Filtra linhas vazias

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("Erro ao gerar perguntas:", error);
    return NextResponse.json({ error: "Erro ao gerar perguntas: " + error }, { status: 500 });
  }
}