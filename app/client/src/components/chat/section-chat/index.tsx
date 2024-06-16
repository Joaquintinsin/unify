import React, { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import UserMessage from "../messages/user-message";
import ChatBotMessage from "../messages/chatbot-message";
import t from "@/lang/locale";
import {
  CLIP,
  SCROLL_BUFFER,
  SEARCH,
  SEND_ARROW,
} from "@/src/utils/constants";
import { subjects, instructions } from "@/src/data";
import { cleanMessage } from "@/src/utils/functions";
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

const SectionChat = () => {
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
  const [retryMessage, setRetryMessage] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userHasScrolled, setUserHasScrolled] = useState<boolean>(false);
  const [currentInstruction, setCurrentInstruction] = useState<number>(1);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [initializedConversation, setInitializedConversation] = useState<boolean>(false);
  const [displayedPDFs, setDisplayedPDFs] = useState<any>({});
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedExamType, setSelectedExamType] = useState(null);

  const displayPDFs = () => {
    if (!selectedYear || !selectedSubject || !selectedExamType) return null;

    const pdfsToShow = pdfs[selectedYear]?.[selectedSubject]?.[selectedExamType] || [];
    return (
      <div className="grid grid-cols-3 gap-4">
        {pdfsToShow.map((doc, index) => (
          <div key={index} className="card">
            <h4>{doc.title}</h4>
            <p>{doc.description}</p>
            <a href={doc.url} target="_blank" rel="noopener noreferrer">Ver PDF</a>
          </div>
        ))}
      </div>
    );
  };



  const { deletedChats } = useContext(DeletedChatsContext);
  const { newChat, newChatStarted, setNewChatStarted } = useContext(NewChatContext);
  const { chatContainerRef } = useContext(ChatContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to handle answering quiz questions
  const handleAnswerQuestion = (selectedOption: string) => {
    // Update user responses
    const newUserResponses = [...userResponses, selectedOption];
    setUserResponses(newUserResponses);
    // Create new user message
    const newUserMessage = { user: "user", message: selectedOption };
    // Append to chat log
    const updatedChatLog = [...chatLog, newUserMessage];
    // Determine next question or end quiz
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
      console.log("Final score:", finalScore, "/", quizQuestions.length);
      const completionMessage = {
        user: "chatbot",
        message: `Quiz completed! Thank you for participating. Your final score is ${finalScore}/${quizQuestions.length}.`
      };
      setChatLog([...updatedChatLog, completionMessage]);
      setQuizCompleted(true);
    }
  };

  // Function to calculate quiz score
  const calculateScore = (responses: string[]) => {
    let correctAnswers = 0;
    quizQuestions.forEach((question, index) => {
      if (question.answer === responses[index]) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  // Filter and display subjects
  const [showAllSubjects, setShowAllSubjects] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pdfs, setPDFs] = useState<any[]>([]);  // Assuming we have a way to fetch or determine related PDFs

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched PDFs:", data);
      setPDFs(organizePDFs(data));
    } catch (error) {
      console.error("Failed to fetch PDFs:", error);
      setPDFs([]); // Manejar el estado de error adecuadamente
    }
  };

  const organizePDFs = (pdfs: any) => {
    return pdfs.reduce((acc: any, pdf: any) => {
      const { academic_year, subject, exam_type, title, url, description } = pdf;
      if (!acc[academic_year]) acc[academic_year] = {};
      if (!acc[academic_year][subject]) acc[academic_year][subject] = {};
      if (!acc[academic_year][subject][exam_type]) acc[academic_year][subject][exam_type] = [];
      acc[academic_year][subject][exam_type].push({ title, url, description });
      return acc;
    }, {});
  };



  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredSubjects = subjects.filter(subject =>
    subject.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const subjectsToShow = showAllSubjects
    ? filteredSubjects
    : filteredSubjects.slice(0, 3);

  const shouldRenderSearchResults = chatSearch;
  const shouldShowInstructions =
    showInstructions && !deletedChats && !newChat && !chatSearch && !chatLog;
  const isNewChat = newChat && chatLog.length === 0 && !chatSearch;
  const renderChat =
    (!showInstructions && !inputChatSearch) || newChat || chatLog;
  const renderSearchInput = !deletedChats && !chatSearch;

  const handleSubmitMessageChat = async (event: React.FormEvent) => {
    event.preventDefault();

    // Clear previous input and file
    setInput("");
    setFile(null);

    setTypingEffect(true);
    setIsTypingChatbot(true);
    setLoadingChatBotMessage(true);

    const formData = new FormData();
    if (input) formData.append("message", input);  // Assuming input is used for something specific
    if (file) formData.append("file", file);

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to fetch questions");

      const data = await response.json();
      console.log("Success:", data.questions_and_answers);
      const questions = data.questions_and_answers;

      const firstQuestion = questions[0];
      const firstQuestionMessage = {
        user: "chatbot",
        message: firstQuestion.question,
        options: firstQuestion.options,
        type: "quiz"
      };

      setQuizQuestions(questions);
      setChatLog([firstQuestionMessage]);  // Start chat with the first question
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error('Error:', error);
      setChatLog([{ user: "chatbot", message: t(locale, "Error fetching questions") }]);
    }

    setIsTypingChatbot(false);
    setLoadingChatBotMessage(false);
  };

  const handleNextInstruction = () => {
    if (currentInstruction <= instructions.length) {
      setCurrentInstruction(currentInstruction + 1);
    } else {
      setShowInstructions(false);
      localStorage.setItem("instructionsSeen", "true");
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

  const [topics, setTopics] = useState([]);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    const relatedPDFs = pdfs?.[subject] || {};
    setDisplayedPDFs(relatedPDFs);
  };


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatLog]);

  return (
    <div className="relative h-[100%] dark:bg-black-800">
      {shouldRenderSearchResults && (
        <div className="h-full w-full dark:bg-black-800">
          <div className="flex items-center gap-3 border-b border-gray-400 bg-gray-300 px-5 py-3 text-[0.9rem] text-gray-600 dark:border-black-600 dark:bg-black-700">
            <img className="h-4" src={SEARCH} alt={t(locale, "Search")} />
            <p>
              {t(locale, "SearchResultsFor")} &nbsp;
              <span className="font-medium text-blue-900 dark:text-white">
                "{inputChatSearch}"
              </span>
              &nbsp;- {t(locale, "ResultsFound")}
            </p>
          </div>
        </div>
      )}

      <div
        className={`${renderSearchInput ? "h-[90%]" : "h-[100%]"
          } relative w-full overflow-y-scroll p-5 dark:bg-black-800`}
        ref={chatContainerRef}
      >
        {shouldShowInstructions && (
          <div className="w-full rounded-lg bg-white px-6 py-3 leading-[1.6rem] dark:bg-black-600">
            <h2 className="font-medium text-blue-900 dark:text-white">
              {t(locale, "WelcomeToBastian")}
            </h2>
            <p className="text-[0.9rem] text-gray-600">
              {t(locale, "OurGoal")}
            </p>

            <div className="mt-3 h-full w-full rounded-lg border border-gray-300 dark:border-black-800">
              {instructions(t, locale)
                .slice(0, currentInstruction)
                .map((instruction, index) => (
                  <div
                    key={index}
                    className="flex items-center border-b border-gray-300 dark:border-black-800"
                  >
                    <div className="flex items-center gap-4 py-3 px-5">
                      <img
                        className="h-4"
                        src={instruction.icon}
                        alt={t(locale, "Instruction")}
                      />
                      <p
                        className="text-[0.9rem] leading-5 text-gray-600 dark:text-white"
                        key={instruction.instruction}
                      >
                        {instruction.instruction}
                      </p>
                    </div>
                  </div>
                ))}
              <div className="flex w-full justify-end">
                <button
                  id="btn"
                  onClick={handleNextInstruction}
                  className={`my-3 mx-5 rounded px-4 pb-[0.35rem] pt-[0.35rem] text-[0.9rem] ${currentInstruction <= instructions.length
                    ? "bg-gray-200 text-blue-700 duration-500 hover:bg-blue-700 hover:text-white dark:bg-black-800 dark:text-white dark:hover:bg-sky-500"
                    : "bg-blue-700 text-white dark:bg-sky-500"
                    }`}
                >
                  {currentInstruction <= instructions.length
                    ? t(locale, "Next")
                    : t(locale, "LetsStart")}
                </button>
              </div>
            </div>
          </div>
        )}

        {isNewChat || quizQuestions?.length == 0 && (
          <div className="w-full rounded-lg bg-white px-6 py-12 leading-[1.6rem] dark:bg-black-500">
            <h2 className="text-center text-xl font-semibold text-blue-900 dark:text-white">
              {t(locale, "StartNewConversation")}
            </h2>
            <p className="mt-[0.65rem] mb-3 text-center text-[0.95rem] text-gray-600">
              {t(locale, "WriteQuestions")}
            </p>

            <input
              type="text"
              placeholder="Buscar materias"
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="mb-4 w-full rounded-lg border bg-gray-200 p-2 text-gray-800 dark:bg-black-700 dark:text-white"
            />

            {subjectsToShow.map((subject, index) => (
              <div
                key={index}
                onClick={() => handleSubjectSelect(subject)}
                className={`gray flex cursor-pointer items-center rounded-lg border bg-gray-300 py-5 px-10 text-gray-600 dark:border-black-800 dark:bg-black-600 dark:text-white ${index === subjectsToShow.length ? "" : "mb-4"
                  }`}
              >
                {subject} &nbsp;
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
            ))}

            {displayPDFs()}

          </div>
        )}

        {renderChat && quizQuestions?.length > 0 && (
          <div className="relative h-full overflow-y-scroll p-5 dark:bg-black-800" ref={chatContainerRef}>
            {chatLog.map((entry: any, index: number) => (
              <div key={index}>
                {entry.user === "user" ? (
                  <UserMessage message={entry.message} />
                ) : (
                  <ChatBotMessage message={entry.message} options={entry.options} onAnswer={handleAnswerQuestion} time={undefined} type={undefined} />
                )}
              </div>
            ))}
          </div>
        )}


        {renderChat && quizQuestions?.length === 0 && (
          <div>
            {chatLog.map((message: any, index: number) => {
              const isUserMessage = message.user === "user";
              if (isUserMessage) {
                return (
                  <UserMessage
                    message={message.message}
                    time={""}
                    key={index}
                  />
                );
              } else if (message.user === "chatbot") {
                return (
                  <ChatBotMessage
                    key={index}
                    message={cleanMessage(message.message)}
                    time={""}
                    conversationId={message.conversationId}
                    messageId={message.messageId}
                    error={message.error}
                  />
                );
              }
            })}
          </div>
        )}
      </div>

      {renderSearchInput && (
        <div className="relative">
          <div className="h-[10%] w-full dark:bg-black-800">
            <div className="relative mx-5">
              <form
                onSubmit={(event: React.FormEvent) => {
                  event.preventDefault();

                  if (chatAvailable) {
                    handleSubmitMessageChat(event);
                    setChatAvailable(false);

                    if (!initializedConversation || !newChatStarted) {
                      setInitializedConversation(true);
                      setNewChatStarted(true);
                    }
                    if (!typingEffect) {
                      setTypingEffect(true);
                    }
                  }
                }}
              >
                <div className="relative">
                  <input
                    type="file"
                    id="file"
                    name="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <span
                    className="absolute inset-y-0 left-0 flex items-center pl-3 cursor-pointer"
                    onClick={handleClipClick}
                  >
                    <img
                      className="h-3 text-gray-400"
                      src={CLIP}
                      alt="clip icon"
                    />
                  </span>
                  <input
                    className={`${chatAvailable ? "bg-white" : "bg-gray-500"
                      } w-full rounded-lg border bg-white py-3 pl-10 pr-16 text-blue-900 placeholder-gray-400 shadow-sm outline-none focus:border-blue-900 focus:shadow dark:border-black-800 dark:bg-black-700 dark:text-white dark:placeholder-gray-600`}
                    type="text"
                    placeholder={file ? file.name : t(locale, "WriteSomething")}
                    value={input}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
                  />
                </div>

                <button
                  className={`absolute right-0 top-0 flex h-full items-center gap-2 pr-5 cursor-pointer`}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    handleSubmitMessageChat(event);
                  }}
                  disabled={!chatAvailable}
                >
                  {!isTypingChatbot && (
                    <img
                      className="h-[0.7rem]"
                      src={SEND_ARROW}
                      alt={t(locale, "Send")}
                    />
                  )}
                  <span className="text-[0.9rem] text-gray-600">
                    {isTypingChatbot ? (
                      <span className="typing-dots">
                        <span className="dot" />
                        <span className="dot" />
                        <span className="dot" />
                      </span>
                    ) : (
                      t(locale, "Send")
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionChat;
