import React, { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import UserMessage from "../messages/user-message";
import ChatBotMessage from "../messages/chatbot-message";
import t from "@/lang/locale";
import { CLIP, SEARCH, SEND_ARROW } from "@/src/utils/constants";
import { ChatLogContext } from "@/src/context/ChatLogContext";
import { ChatHistoryContext } from "@/src/context/ChatHistoryContext";
import { ChatSearchContext } from "@/src/context/ChatSearchContext";
import { LoadingChatBotMessageContext } from "@/src/context/LoadingChatBotMessage";
import { DeletedChatsContext } from "@/src/context/DeletedChatsContext";
import { NewChatContext } from "@/src/context/NewChatContext";
import { ChatContext } from "@/src/context/ScrollToBottom";

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
  const { chatHistory } = useContext(ChatHistoryContext);
  const { chatSearch, inputChatSearch } = useContext(ChatSearchContext);
  const { setLoadingChatBotMessage } = useContext(LoadingChatBotMessageContext);
  const {
    chatLog,
    chatAvailable,
    setChatAvailable,
    setChatLog,
    typingEffect,
    isTypingChatbot,
    setIsTypingChatbot,
    setTypingEffect,
  } = useContext(ChatLogContext);

  const [input, setInput] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [pdfs, setPDFs] = useState<PDFs>({});
  const [pdfsToShow, setPdfsToShow] = useState<PDF[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ year: string | null, subject: string | null, examType: string | null }>>([]);
  const { deletedChats } = useContext(DeletedChatsContext);
  const { newChat, newChatStarted, setNewChatStarted } = useContext(NewChatContext);
  const { chatContainerRef } = useContext(ChatContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setPDFs(organizePDFs(data));
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const organizePDFs = (documents: any[]) => {
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
    setPdfsToShow([]);
  };

  const handleSubjectSelect = (subject: string) => {
    setHistory([...history, { year: selectedYear, subject: selectedSubject, examType: selectedExamType }]);
    setSelectedSubject(subject);
    setSelectedExamType(null);
    setPdfsToShow([]);
  };

  const handleExamTypeSelect = (examType: string) => {
    setHistory([...history, { year: selectedYear, subject: selectedSubject, examType: selectedExamType }]);
    setSelectedExamType(examType);
    setPdfsToShow(pdfs[selectedYear!][selectedSubject!][examType] || []);
  };

  const handleBack = () => {
    const lastState = history.pop();
    if (lastState) {
      setSelectedYear(lastState.year);
      setSelectedSubject(lastState.subject);
      setSelectedExamType(lastState.examType);
      if (lastState.examType) {
        setPdfsToShow(pdfs[lastState.year!][lastState.subject!][lastState.examType] || []);
      } else if (lastState.subject) {
        setPdfsToShow([]);
      } else {
        setPdfsToShow([]);
      }
      setHistory(history);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleClipClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
        type: "quiz"
      };
      setChatLog([...updatedChatLog, newQuestionMessage]);
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      const finalScore = calculateScore(newUserResponses);
      const completionMessage = {
        user: "chatbot",
        message: `Quiz completed! Thank you for participating. Your final score is ${finalScore}/${quizQuestions.length}.`
      };
      setChatLog([...updatedChatLog, completionMessage]);
      setQuizCompleted(true);
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

    setTypingEffect(true);
    setIsTypingChatbot(true);
    setLoadingChatBotMessage(true);

    const formData = new FormData();
    if (input) formData.append("message", input);
    if (file) formData.append("file", file);

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
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
        type: "quiz"
      };

      setQuizQuestions(questions);
      setChatLog([firstQuestionMessage]);
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error('Error:', error);
      setChatLog([{ user: "chatbot", message: t(locale, "Error fetching questions") }]);
    }

    setIsTypingChatbot(false);
    setLoadingChatBotMessage(false);
  };

  const displayPDFs = () => {
    if (!selectedYear || !selectedSubject || !selectedExamType) return null;

    const pdfsToShow = pdfs[selectedYear]?.[selectedSubject]?.[selectedExamType] || [];
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pdfsToShow.map((doc, index) => (
          <div key={index} className="card border rounded-lg shadow-lg overflow-hidden">
            <iframe src={doc.url} title={doc.title} className="w-full h-64" />
            <div className="p-4">
              <h4 className="font-bold text-lg mb-2">{doc.title}</h4>
              <p className="text-gray-700 mb-4">{doc.description}</p>
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mb-2 inline-block">Ver PDF</a>
              <button
                onClick={() => handlePDFSelect(doc)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Generar Cuestionario
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handlePDFSelect = async (pdf: any) => {
    const formData = new FormData();
    formData.append("url", pdf.url);  // Añade solo la URL como parámetro 'url'
    console.log("PDF URL:", pdf.url);

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
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
        type: "quiz"
      };

      setQuizQuestions(questions);
      setChatLog([firstQuestionMessage]);
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error('Error:', error);
      setChatLog([{ user: "chatbot", message: "Error fetching questions from PDF" }]);
    }
  };

  return (
    <div className="relative h-full dark:bg-gray-900">
      {history.length > 0 && (
        <button onClick={handleBack} className="back-button bg-gray-200 dark:bg-gray-700 p-2 rounded-md m-2">
          Back
        </button>
      )}

      <div className="selections p-4">
        {!selectedYear && (
          <div className="years grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(pdfs).map((year, index) => (
              <Option
                key={index}
                label={year}
                onClick={() => handleYearSelect(year)}
                selected={selectedYear === year}
              />
            ))}
          </div>
        )}
        {selectedYear && !selectedSubject && (
          <div className="subjects grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(pdfs[selectedYear]).map((subject, index) => (
              <Option
                key={index}
                label={subject}
                onClick={() => handleSubjectSelect(subject)}
                selected={selectedSubject === subject}
              />
            ))}
          </div>
        )}
        {selectedSubject && !selectedExamType && (
          <div className="exam-types grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(pdfs[selectedYear][selectedSubject]).map((examType, index) => (
              <Option
                key={index}
                label={examType}
                onClick={() => handleExamTypeSelect(examType)}
                selected={selectedExamType === examType}
              />
            ))}
          </div>
        )}
      </div>

      {displayPDFs()}

      <div className={`${chatLog.length === 0 ? "hidden" : "block"} relative h-full overflow-y-scroll p-5 dark:bg-gray-800`} ref={chatContainerRef}>
        {chatLog.map((entry: any, index: number) => (
          <div key={index}>
            {entry.user === "user" ? (
              <UserMessage message={entry.message} />
            ) : (
              <ChatBotMessage message={entry.message} options={entry.options} onAnswer={handleAnswerQuestion} />
            )}
          </div>
        ))}
      </div>

      <div className="w-full p-3 bg-white shadow-inner fixed bottom-0 left-0 right-0 dark:bg-gray-800" style={{ height: '10%' }}>
        <form onSubmit={handleSubmitMessageChat} className="flex items-center justify-between">
          <label htmlFor="file-upload" className="cursor-pointer">
            <img src={CLIP} alt="Attach file" className="inline-block h-6 w-6 mr-2 text-gray-600 dark:text-gray-200" />
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf, .doc, .txt" // Ajusta según los tipos de archivo que necesites aceptar
            />
          </label>
          <button type="submit" className="ml-2 text-blue-500 dark:text-blue-400">
            {isTypingChatbot ? (
              <div className="dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            ) : (
              <span>Enviar</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const Option: React.FC<{ label: string; onClick: () => void; selected: boolean }> = ({ label, onClick, selected }) => (
  <div
    onClick={onClick}
    className={`flex cursor-pointer items-center rounded-lg border bg-gray-300 py-5 px-10 text-gray-600 dark:border-gray-700 dark:bg-gray-600 dark:text-white ${selected ? "bg-gray-400 dark:bg-gray-500" : ""}`}
  >
    {label} &nbsp;
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
      />
    </svg>
  </div>
);

export default SectionChat;
