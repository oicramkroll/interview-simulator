import { NextResponse } from "next/server";
import { OpenAI } from "openai";

//const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAI({
  //apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1", // OpenRouter usa essa URL
});

export async function POST(req: Request) {
  try {
    const { questions, answers } = await req.json();
    const evaluations = [];

    for (let i = 0; i < questions.length; i++) {
      const prompt = `Pergunta: ${questions[i]}\nResposta: ${answers[i]}\nAvalie se a resposta está correta, parcialmente correta ou errada e explique o motivo.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "system", content: prompt }],
      });

      evaluations.push(completion.choices[0].message?.content || "Erro ao avaliar.");
    }

    return NextResponse.json({ feedback: evaluations }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao avaliar respostas" }, { status: 500 });
  }
}