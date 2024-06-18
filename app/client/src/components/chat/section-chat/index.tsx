import React, { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import UserMessage from "../messages/user-message";
import ChatBotMessage from "../messages/chatbot-message";
import t from "@/lang/locale";
import { BOT, BOTCITO, SEND_ARROW } from "@/src/utils/constants";
import { ChatLogContext } from "@/src/context/ChatLogContext";
import { LoadingChatBotMessageContext } from "@/src/context/LoadingChatBotMessage";
import { ChatContext } from "@/src/context/ScrollToBottom";
import { Option } from "../../option";
import {
  FaFilePdf,
} from "react-icons/fa";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface PDF {
  title: string;
  url: string;
  description: string;
}

interface PDFs {
  [year: string]: {
    [subject: string]: {
      [examType: string]: PDF[];
    };
  };
}

const SectionChat: React.FC = () => {
  const { locale } = useRouter();
  const { setLoadingChatBotMessage } = useContext(LoadingChatBotMessageContext);
  const { chatLog, setChatLog, setIsTypingChatbot, setTypingEffect } = useContext(ChatLogContext);

  const [input, setInput] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [pdfs, setPDFs] = useState<PDFs>({});
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ year: string | null; subject: string | null; examType: string | null }>>([]);
  const { chatContainerRef } = useContext(ChatContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      setPDFs(organizePDFs(data));
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const organizePDFs = (documents: any[]): PDFs => {
    return documents.reduce((acc: PDFs, doc: any) => {
      const { academic_year, subject, exam_type, title, document_url, description } = doc;
      if (!acc[academic_year]) acc[academic_year] = {};
      if (!acc[academic_year][subject]) acc[academic_year][subject] = {};
      if (!acc[academic_year][subject][exam_type]) acc[academic_year][subject][exam_type] = [];
      acc[academic_year][subject][exam_type].push({ title, url: document_url, description });
      return acc;
    }, {});
  };

  const handleYearSelect = (year: string) => {
    setHistory([...history, { year: selectedYear, subject: selectedSubject, examType: selectedExamType }]);
    setSelectedYear(year);
    setSelectedSubject(null);
    setSelectedExamType(null);
  };

  const handleSubjectSelect = (subject: string) => {
    setHistory([...history, { year: selectedYear, subject: selectedSubject, examType: selectedExamType }]);
    setSelectedSubject(subject);
    setSelectedExamType(null);
  };

  const handleExamTypeSelect = (examType: string) => {
    setHistory([...history, { year: selectedYear, subject: selectedSubject, examType }]);
    setSelectedExamType(examType);
  };

  const handleBack = () => {
    const lastState = history.pop();
    if (lastState) {
      setSelectedYear(lastState.year);
      setSelectedSubject(lastState.subject);
      setSelectedExamType(lastState.examType);
      setHistory(history);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleClipClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnswerQuestion = (selectedOption: string) => {
    const newUserResponses = [...userResponses, selectedOption];
    setUserResponses(newUserResponses);
    const newUserMessage = { user: "user", message: selectedOption };
    const updatedChatLog = [...chatLog, newUserMessage];
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < quizQuestions.length) {
      const nextQuestion = quizQuestions[nextQuestionIndex];
      const newQuestionMessage = {
        user: "chatbot",
        message: nextQuestion.question,
        options: nextQuestion.options,
        type: "quiz",
      };
      setChatLog([...updatedChatLog, newQuestionMessage]);
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      const finalScore = calculateScore(newUserResponses);
      const completionMessage = {
        user: "chatbot",
        message: `Quiz completed! Thank you for participating. Your final score is ${finalScore}/${quizQuestions.length}.`,
      };
      setChatLog([...updatedChatLog, completionMessage]);
    }
  };

  const calculateScore = (responses: string[]) => {
    let correctAnswers = 0;
    quizQuestions.forEach((question, index) => {
      if (question.answer === responses[index]) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const handleSubmitMessageChat = async (event: React.FormEvent) => {
    event.preventDefault();
    setInput("");
    setFile(null);
    setIsLoading(true); // Activa la pantalla de carga

    const formData = new FormData();
    if (input) formData.append("message", input);
    if (file) formData.append("file", file);

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to fetch questions");

      const data = await response.json();
      const questions = data.questions_and_answers;

      const firstQuestion = questions[0];
      const firstQuestionMessage = {
        user: "chatbot",
        message: firstQuestion.question,
        options: firstQuestion.options,
        type: "quiz",
      };

      setQuizQuestions(questions);
      setChatLog([firstQuestionMessage]);
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error("Error:", error);
      setChatLog([{ user: "chatbot", message: t(locale, "Error fetching questions") }]);
    }

    setIsLoading(false); // Desactiva la pantalla de carga
  };

  const displayPDFs = () => {
    if (!selectedYear || !selectedSubject || !selectedExamType) return null;

    const pdfsToShow = pdfs[selectedYear]?.[selectedSubject]?.[selectedExamType] || [];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pdfsToShow.map((doc, index) => (
          <div key={index} className="border shadow-lg rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
            <iframe src={doc.url} title={doc.title} className="w-full h-64" />
            <div className="p-4">
              <h4 className="font-bold text-lg mb-2">{doc.title}</h4>
              <p className="text-gray-700 mb-4">{doc.description}</p>
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mb-2 inline-block transition-colors duration-300 hover:text-blue-600">
                Ver PDF
              </a>
              <button onClick={() => handlePDFSelect(doc)} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300">
                Generar Cuestionario
              </button>
            </div>
          </div>
        ))}
      </div>
    );

  };

  const handlePDFSelect = async (pdf: any) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("url", pdf.url);

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to fetch questions from PDF");

      const data = await response.json();
      const questions = data.questions_and_answers;

      const firstQuestion = questions[0];
      const firstQuestionMessage = {
        user: "chatbot",
        message: firstQuestion.question,
        options: firstQuestion.options,
        type: "quiz",
      };

      setQuizQuestions(questions);
      setChatLog([firstQuestionMessage]);
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error("Error:", error);
      setChatLog([{ user: "chatbot", message: "Error fetching questions from PDF" }]);
    } finally {
      setIsLoading(false); // Detiene la pantalla de carga
    }
  };


  return (
    <div className="bg-gray-500 relative h-full w-full py-5 flex flex-col items-center">
      {isLoading && (
        <div className="flex h-full w-full items-center justify-center">
          <div className=" text-center flex mt-28 flex-col justify-center items-center">
            <div style={{ animation: 'slow-bounce 2s infinite' }}> {/* Ajusta aquí para cambiar la duración */}
              <img src={BOTCITO} alt="Loading" className="h-32 mx-auto" />
            </div>
            <p className="font-semibold text-2xl mt-2">Estamos realizando la búsqueda...</p>
            <span className="py-3 text-gray-600 text-xl font-medium">Por favor aguarda un momento</span>
            <h2 className="text-gray-600 font-bold text-xl">83%</h2>
          </div>
        </div>
      )}
      {!isLoading &&
        <div className={`w-full flex-1 ${!quizQuestions.length && "items-center"} flex flex-col overflow-y-auto p-5 dark:bg-gray-800`} ref={chatContainerRef}>
          {!quizQuestions.length &&
            <div className="sticky top-0 z-10 bg-white dark:bg-black-500 w-3/4 text-center py-2 flex justify-between items-center">
              <button
                onClick={handleBack}
                className={`custom-button ml-10 text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-gray-300`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h2 className="text-xl pt-4 font-semibold text-blue-900 dark:text-white">
                  {t(locale, "Start a new conversation")}
                </h2>
                <p className="text-[0.95rem] text-gray-600">
                  {t(locale, "WriteQuestions")}
                </p>
              </div>
              <div style={{ width: '1.5rem' }}> {/* Espacio en blanco para centrar el título */}
              </div>
            </div>}
          {/* Contenido principal con scroll */}
          {chatLog.length === 0 ? (
            <>
              <div className={`${quizQuestions.length ? "w-[90%]" : "w-3/4"} h-[22rem] overflow-y-auto rounded-b-lg bg-white px-10 leading-[1.6rem] dark:bg-black-500`}>
                {!selectedYear && (
                  Object.keys(pdfs).map((year, index) => (
                    <Option key={index} label={year} onClick={() => handleYearSelect(year)} selected={selectedYear === year} />
                  ))
                )}

                {!file && selectedYear && !selectedSubject && (
                  Object.keys(pdfs[selectedYear]).map((subject, index) => (
                    <Option key={index} label={subject} onClick={() => handleSubjectSelect(subject)} selected={selectedSubject === subject} />
                  ))
                )}

                {!file && selectedSubject && !selectedExamType && (
                  <div className="exam-types grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                    {Object.keys(pdfs[selectedYear][selectedSubject]).map((examType, index) => (
                      <Option key={index} label={examType} onClick={() => handleExamTypeSelect(examType)} selected={selectedExamType === examType} />
                    ))}
                  </div>
                )}

                {!file && displayPDFs()}
              </div>
            </>
          ) : (
            <>
              {chatLog.map((entry: any, index: number) => (
                <div key={index} ref={index === chatLog.length - 1 ? lastMessageRef : null}>
                  {entry.user === "user" ? (
                    <UserMessage message={entry.message} />
                  ) : (
                    <ChatBotMessage message={entry.message} options={entry.options} onAnswer={handleAnswerQuestion} />
                  )}
                </div>
              ))}
            </>
          )}

          {/* Elemento sticky para "Select your file" */}
          {!quizQuestions.length &&
            <div className="sticky bottom-0 z-10 mt-5 w-full text-center py-2">
              <label htmlFor="file-upload" className="cursor-pointer">
                <button
                  type="button"
                  onClick={handleClipClick}
                  className={`button px-4 py-2 rounded ${file ? "bg-green-500 text-white" : "bg-gray-500 text-gray-100"}`}
                >
                  Sube tu propio Archivo :)
                </button>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf, .doc, .txt"
                  ref={fileInputRef}
                />
              </label>
              {file && (
                <div className="w-full items-center justify-center flex">
                  <button
                    onClick={handleSubmitMessageChat} className="hidden justify-center items-center md:block px-4 mt-4">
                    <button className="bg-white border cursor-default justify-center w-full mx-auto shadow border-red-500 flex p-3 rounded text-black-200 hover:border-red-700 transition duration-300 ease-in-out transform hover:translate-y-[-2px] hover:shadow-lg">
                      <FaFilePdf size={24} className="text-red-500" />
                      <p className="ml-2">{file.name}</p>
                    </button>
                  </button>

                  <button className="send">
                    <div className="svg-wrapper-1">
                      <div className="svg-wrapper">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                        >
                          <path fill="none" d="M0 0h24v24H0z"></path>
                          <path
                            fill="currentColor"
                            d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <span>Send</span>
                  </button>
                </div>


              )}
            </div>}
        </div>}
    </div>
  );
};

export default SectionChat;
