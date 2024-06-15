import React, { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import UserMessage from "../messages/user-message";
import ChatBotMessage from "../messages/chatbot-message";
import { ChatLogContext } from "@/src/context/ChatLogContext";
import { NewChatContext } from "@/src/context/NewChatContext";
import { DeletedChatsContext } from "@/src/context/DeletedChatsContext";
import { ChatSearchContext } from "@/src/context/ChatSearchContext";
import t from "@/lang/locale";
import {
  CLIP,
  LIMIT_NUMBER_STANDARD_CONVERSATIONS,
  SCROLL_BUFFER,
  SEARCH,
  SEND_ARROW,
} from "@/src/utils/constants";
import { frequentQuestions, instructions } from "@/src/data";
import { LoadingChatBotMessageContext } from "@/src/context/LoadingChatBotMessage";
import { ChatContext } from "@/src/context/ScrollToBottom";
import { useRouter } from "next/router";
import { ConversationContext } from "@/src/context/ConversationContext";
import { cleanMessage } from "@/src/utils/functions";
import { ChatHistoryContext } from "@/src/context/ChatHistoryContext";
import { ShowSubscriptionToVersionPremiumPopupContext } from "@/src/context/ShowSubscriptionToVersionPremiumPopupContext";

const SectionChat = () => {
  const { locale } = useRouter();
  const { setConversationId, conversationId } = useContext(ConversationContext);

  const [input, setInput] = useState("");
  const [retryMessage, setRetryMessage] = useState(false);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(1);
  const [showInstructions, setShowInstructions] = useState(false);
  const [regenerateQuestion, setRegenerateQuestion] = useState(false);
  const [initializedConversation, setInitializedConversation] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [quizQuestions, setQuizQuestions] = useState<any>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const { chatHistory } = useContext(ChatHistoryContext);
  const { setShowSubscriptionToVersionPremium } = useContext(
    ShowSubscriptionToVersionPremiumPopupContext
  );
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
  const { deletedChats } = useContext(DeletedChatsContext);
  const { newChat, newChatStarted, setNewChatStarted } =
    useContext(NewChatContext);

  const shouldRenderSearchResults = chatSearch;
  const shouldShowInstructions =
    showInstructions && !deletedChats && !newChat && !chatSearch && !chatLog;
  const isNewChat = newChat && chatLog.length === 0 && !chatSearch;
  const renderChat =
    (!showInstructions && !inputChatSearch) || newChat || chatLog;
  const renderSearchInput = !deletedChats && !chatSearch;

  const { chatContainerRef } = useContext(ChatContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = (event: any) => {
      const userScrolledUp =
        event.target.scrollHeight - event.target.scrollTop >
        event.target.clientHeight + SCROLL_BUFFER;

      if (userScrolledUp) {
        setUserHasScrolled(true);
      } else {
        setUserHasScrolled(false);
      }
    };

    return () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [chatLog, isTypingChatbot]);

  useEffect(() => {
    if (chatContainerRef.current && !userHasScrolled) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatLog]);

  useEffect(() => {
    const instrucctionsSeen =
      localStorage.getItem("instructionsSeen") === "true";

    if (!instrucctionsSeen) {
      setShowInstructions(true);
    }
  }, []);

  const handleSubmitMessageChat: any = async (
    event: any
  ) => {
    if (event) {
      event.preventDefault();
    }

    if (chatHistory?.length === LIMIT_NUMBER_STANDARD_CONVERSATIONS) {
      setShowSubscriptionToVersionPremium(true);
      return;
    }

    if (regenerateQuestion) setRegenerateQuestion(false);

    setTypingEffect(true);
    setIsTypingChatbot(true);
    setLoadingChatBotMessage(true);

    let messageContent = input;
    if (file) {
      messageContent = `${input} [Archivo adjunto: ${file.name}]`;
    }

    let chatLogNew = [...chatLog, { user: "user", message: messageContent }];
    let loadingChatLogNew = [...chatLogNew, { user: "chatbot", message: "" }];
    setChatLog(loadingChatLogNew);
    let newChatLog: any = [...chatLog, { user: "user", message: messageContent }];
    setInput("");
    setFile(null);

    try {
      const formData = new FormData();
      formData.append("message", input);
      if (file) {
        formData.append("file", file);
      }
      if (conversationId) {
        formData.append("conversationId", conversationId);
      }

      fetch('/api/generate-questions', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data.questions_and_answers)
          const questions = data.questions_and_answers;
          const questionMessages = questions.map((question: any) => ({
            user: "chatbot",
            message: question.question + "?? ",
            options: question.options,
            answer: question.answer,
            type: "quiz"
          }));
          setQuizQuestions(questions);
          setChatLog([...newChatLog, ...questionMessages]);
        })
        .catch((error) => {
          console.error('Error:', error);
        });

      setChatLog(newChatLog);
      setLoadingChatBotMessage(false);
      setIsTypingChatbot(false);
    } catch (error) {
      console.error("Error:", error);

      setTimeout(() => {
        setRegenerateQuestion(true);
      }, 2500);

      const failedMessage = {
        user: "chatbot",
        message: t(locale, "Error"),
        conversationId: undefined,
        messageId: undefined,
        error: true,
      };

      newChatLog.push(failedMessage);
    }
  };

  useEffect(() => {
    if (retryMessage) {
      handleSubmitMessageChat();
      setRetryMessage(false);
    }
  }, [chatLog]);

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

  useEffect(() => {
    if (quizCompleted) {
      alert(`Quiz completed! Your score is ${score}/${quizQuestions?.length}`);
    }
  }, [quizCompleted, score, quizQuestions?.length]);

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
                .map((instruction) => (
                  <div
                    key={instruction.instruction}
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

            {frequentQuestions(t, locale).map((question, index) => (
              <div
                key={index}
                className={`gray flex cursor-pointer items-center rounded-lg border bg-gray-300 py-5 px-10 text-gray-600 dark:border-black-800 dark:bg-black-600 dark:text-white ${index === frequentQuestions.length ? "" : "mb-4"
                  }`}
                onClick={() => setInput(question.question)}
              >
                {question.question} &nbsp;
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
          </div>
        )}

        {renderChat && quizQuestions?.length > 0 && !quizCompleted && (
          <div>
            {chatLog.map((message: any, index) => {
              if (message.user === "user") {
                return <UserMessage key={index} message={message.message} time={""} />;
              } else if (message.user === "chatbot") {
                return (
                  <ChatBotMessage
                    key={index}
                    message={message.message}
                    time={message.time}
                    options={message.options}
                    type={message.type}
                  />);
              }
            })}
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
                onSubmit={(event) => {
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
                    onChange={(event) => setInput(event.target.value)}
                  />
                </div>

                <button
                  className={`absolute right-0 top-0 flex h-full items-center gap-2 pr-5 cursor-pointer`}
                  onClick={(event) => {
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
