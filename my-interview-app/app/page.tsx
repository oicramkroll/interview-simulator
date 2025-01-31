"use client"; // Corrigido, agora o Next.js reconhecerá como um Client Component
import { useState, useEffect } from "react";
import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean[]>([]);

  const generateQuestions = async () => {
    if (!topic) return alert("Informe um tema para a entrevista!");

    const response = await fetch("/api/generateQuestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, numQuestions }),
    });

    const data = await response.json();
    setQuestions(data.questions);
    setAnswers(Array(data.questions.length).fill(""));
    setFeedback([]);
    setIsRecording(Array(data.questions.length).fill(false));
  };

  const checkAnswers = async () => {
    const response = await fetch("/api/checkAnswers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions, answers }),
    });

    const data = await response.json();
    setFeedback(data.feedback);
  };

  const speakQuestion = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = (index: number) => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    recognition.onstart = () => {
      const newRecordingStatus = [...isRecording];
      newRecordingStatus[index] = true;
      setIsRecording(newRecordingStatus);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const newAnswers = [...answers];
      newAnswers[index] = transcript;
      setAnswers(newAnswers);

      const newRecordingStatus = [...isRecording];
      newRecordingStatus[index] = false;
      setIsRecording(newRecordingStatus);
    };

    recognition.onerror = () => {
      const newRecordingStatus = [...isRecording];
      newRecordingStatus[index] = false;
      setIsRecording(newRecordingStatus);
    };

    recognition.start();
  };

  return (
    <div className="container mt-4">
      <Head>
        <title>Entrevista em Inglês</title>
      </Head>

      <h1 className="mb-4">Simulador de Entrevista em Inglês</h1>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Digite um tema"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <input
          type="number"
          className="form-control"
          placeholder="Número de perguntas"
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
        />
      </div>

      <button className="btn btn-primary mb-3" onClick={generateQuestions}>
        Gerar Perguntas
      </button>

      {questions.length > 0 && (
        <div>
          {questions.map((q, i) => (
            <div key={i} className="mb-3">
              <div className="d-flex align-items-center">
                <p className="me-2">{i + 1}. {q}</p>
                <button className="btn btn-sm btn-secondary" onClick={() => speakQuestion(q)}>🔊</button>
              </div>

              {/* Resposta em texto */}
              <input
                type="text"
                className="form-control"
                placeholder="Digite sua resposta"
                value={answers[i]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[i] = e.target.value;
                  setAnswers(newAnswers);
                }}
              />
              
              {/* Botão para resposta por áudio */}
              <button
                className={`btn btn-sm ${isRecording[i] ? "btn-danger" : "btn-info"} mt-2`}
                onClick={() => startRecording(i)}
                disabled={isRecording[i]}
              >
                {isRecording[i] ? "Gravando..." : "Gravar Resposta"}
              </button>

              {feedback[i] && <p className="mt-2"><strong>Feedback:</strong> {feedback[i]}</p>}
            </div>
          ))}
          <button className="btn btn-success mt-3" onClick={checkAnswers}>
            Verificar Respostas
          </button>
        </div>
      )}
    </div>
  );
}