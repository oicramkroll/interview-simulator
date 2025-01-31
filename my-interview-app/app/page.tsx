"use client";
import { useState } from "react";
import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css";

const QuestionCard = ({ question, index, answer, feedback, isRecording, isChecking, onAnswerChange, onStartRecording, onSpeakQuestion, onCheckAnswer }) => (
  <div key={index} className="mb-3">
    <div className="d-flex align-items-center">
      <p className="me-2">{index + 1}. {question}</p>
      <button title="Ouvir" className="btn btn-sm btn-secondary mb-3" onClick={() => onSpeakQuestion(question)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
        &nbsp;&nbsp;&nbsp;Ouvir
      </button>
    </div>

    <input
      type="text"
      className="form-control"
      placeholder="Digite sua resposta"
      value={answer}
      onChange={(e) => onAnswerChange(index, e.target.value)}
    />

    <button
      className={`btn btn-sm ${isRecording ? "btn-danger" : "btn-info"} mt-2 text-white`}
      onClick={() => onStartRecording(index)}
      disabled={isRecording}
      aria-label={isRecording ? "Gravando" : "Gravar Resposta"}
      title="Falar" 
    >
      {isRecording ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="loading-icon">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <path d="M12 19v4" />
          <path d="M8 23h8" />
        </svg>
      )}
      &nbsp;&nbsp;&nbsp;{isRecording ? "Gravando..." : "Falar"}
    </button>

    <button
      className="btn btn-sm btn-success mt-2 ms-2"
      onClick={() => onCheckAnswer(index)}
      disabled={isChecking}
      title="Verificar" 
    >
      {isChecking ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="loading-icon">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          &nbsp;&nbsp;&nbsp;Verificando...
        </>
        
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
          &nbsp;&nbsp;&nbsp;Verificar
        </>
      )}
    </button>

    {feedback && <p className="mt-2"><strong>Feedback:</strong> {feedback}</p>}
  </div>
);

export default function Home() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState<boolean[]>([]); // Estado para controle de carregamento

  const generateQuestions = async () => {
    if (!topic) return alert("Informe um tema para a entrevista!");
    if (numQuestions < 1 || numQuestions > 20) return alert("O número de perguntas deve estar entre 1 e 20.");
    setIsLoading(true);

    try {
      const response = await fetch("/api/generateQuestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, numQuestions }),
      });

      const data = await response.json();
      setQuestions(data.questions);
      setAnswers(Array(data.questions.length).fill(""));
      setFeedback(Array(data.questions.length).fill(""));
      setIsRecording(Array(data.questions.length).fill(false));
      setIsChecking(Array(data.questions.length).fill(false)); // Inicializa o estado de carregamento
    } catch (error) {
      console.error("Erro ao gerar perguntas:", error);
      alert("Erro ao gerar perguntas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkAnswer = async (index: number) => {
    if (!answers[index]) return alert("Digite ou grave uma resposta antes de verificar.");

    const newIsChecking = [...isChecking];
    newIsChecking[index] = true; // Ativa o estado de carregamento
    setIsChecking(newIsChecking);

    try {
      const response = await fetch("/api/checkAnswers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: [questions[index]], answers: [answers[index]] }),
      });

      if (!response.ok) throw new Error("Erro ao verificar resposta");
      const data = await response.json();
      const newFeedback = [...feedback];
      newFeedback[index] = data.feedback[0];
      setFeedback(newFeedback);
    } catch (error) {
      console.error("Erro ao verificar resposta:", error);
      alert("Erro ao verificar resposta. Tente novamente.");
    } finally {
      const newIsChecking = [...isChecking];
      newIsChecking[index] = false; // Desativa o estado de carregamento
      setIsChecking(newIsChecking);
    }
  };

  const speakQuestion = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = (index: number) => {
    if (isRecording.some((status) => status)) {
      alert("Conclua a gravação atual antes de iniciar uma nova.");
      return;
    }

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
      alert("Erro durante a gravação. Tente novamente.");
    };

    recognition.start();
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  return (
    <div className="container mt-4">
      <Head>
        <title>Entrevista em Inglês</title>
        <meta name="description" content="Simulador de entrevista em inglês com geração de perguntas e avaliação de respostas." />
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

      <button 
        className="btn btn-primary mb-3" 
        onClick={generateQuestions} 
        disabled={isLoading}
        title="Gerar"
      >
        {isLoading ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="loading-icon">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
            <path d="M10 9H8" />
          </svg>
        )}
        &nbsp;&nbsp;&nbsp;{isLoading ? "Gerando..." : "Gerar"}
      </button>

      {questions.length > 0 && (
        <div>
          {questions.map((q, i) => (
            <QuestionCard
              key={i}
              question={q}
              index={i}
              answer={answers[i]}
              feedback={feedback[i]}
              isRecording={isRecording[i]}
              isChecking={isChecking[i]} // Passa o estado de carregamento
              onAnswerChange={handleAnswerChange}
              onStartRecording={startRecording}
              onSpeakQuestion={speakQuestion}
              onCheckAnswer={checkAnswer}
            />
          ))}
        </div>
      )}
    </div>
  );
}