import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
    const { questions, answers } = await req.json();

    // Validação de entrada
    if (!Array.isArray(questions) || !Array.isArray(answers) || questions.length !== answers.length) {
      return NextResponse.json({ error: "Dados de entrada inválidos" }, { status: 400 });
    }

    // Limitação de tamanho
    if (questions.length > 10) {
      return NextResponse.json({ error: "Número máximo de perguntas excedido (10)" }, { status: 400 });
    }

    // Processamento paralelo
    const evaluations = await Promise.all(
      questions.map(async (question, i) => {
        const prompt = `Avalie a resposta abaixo com base na pergunta fornecida. Classifique como "Correta", "Parcialmente Correta" ou "Errada" e justifique sua avaliação de forma clara e detalhada.\n\nPergunta: ${question}\nResposta: ${answers[i]}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo", // Alterado para gpt-3.5-turbo
          messages: [{ role: "system", content: prompt }],
        });

        return completion.choices[0].message?.content || "Erro ao avaliar.";
      })
    );

    return NextResponse.json({ feedback: evaluations }, { status: 200 });
  } catch (error) {
    console.error("Erro ao avaliar respostas:", error);
    return NextResponse.json({ error: "Erro ao avaliar respostas" }, { status: 500 });
  }
}