import { NextResponse } from "next/server";
import OpenAI from "openai"; // Corrigido: Importação correta

//const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAI({
  //apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1", // OpenRouter usa essa URL
});


export async function POST(req: Request) {
  try {
    const { topic, numQuestions } = await req.json();

    if (!topic || !numQuestions) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const prompt = `Crie ${numQuestions} perguntas de entrevista sobre "${topic}" em inglês. Liste uma por linha.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Alterado para gpt-3.5-turbo
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    if (!responseText) {
      return NextResponse.json({ error: "Resposta inválida da OpenAI" }, { status: 500 });
    }

    const questions = responseText.split("\n").filter(q => q.trim().length > 0);

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("Erro ao gerar perguntas:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}