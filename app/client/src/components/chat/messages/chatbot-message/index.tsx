/* Imports */
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import t from "@/lang/locale";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  ETENDO_CHAT,
  REFORMULATE,
  REFORMULATE_PURPLE,
  COPY_PURPLE,
  COPY,
  TYPING_DELAY,
  CHUNK_SIZE,
  SCROLL_BUFFER,
  MESSAGE_LENGTH_THRESHOLD,
  TYPING_INTERVAL,
} from "@/src/utils/constants";
import { MessageProps } from "@/src/utils/types";
import { ChatContext } from "@/src/context/ScrollToBottom";
import { ChatLogContext } from "@/src/context/ChatLogContext";

import { CodeComponent } from "./code-component";
import { AnchorComponent } from "./anchor-component";
import LoadingChatBotMessage from "./loading-message";
import { ListItemComponent } from "./list-item-component";
import { ParagraphComponent } from "./paragraph-component";
import { chatbotMessageStyles } from "@/src/utils/styles";
import { featuresConfig } from "@/src/utils/featuresConfig";
import { ThemeModeContext } from "@/src/context/ThemeModeContext";

// Define a functional component called ChatBotMessage that takes in two props, message and time.
const ChatBotMessage = ({ message, time, messageId, error }: MessageProps) => {
  const { locale } = useRouter();

  // Declare state variables to track whether the message has been copied, whether the smiley face icon is being hovered over, whether the sad face icon is being hovered over, whether the "reformulate answer" icon is being hovered over, and whether the "copy text" icon is being hovered over.
  const [copiedText, setCopiedText] = useState(false);
  const [isHoverReformulate, setIsHoverReformulate] = useState(false);
  const [isHoverCopy, setIsHoverCopy] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [messageReady, setMessageReady] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  // useContext
  const { typingEffect, setIsTypingChatbot, setChatAvailable } =
    useContext(ChatLogContext);
  const { darkMode } = useContext(ThemeModeContext);

  // this constant appends a string to the message, allowing it to be rendered differently
  const renderMessage = message + ` ?? ${t(locale, "ThisAnswerHelpful")}`;

  // secondary effect to realize the typing effect
  useEffect(() => {
    if (typingEffect) {
      if (message) {
        setMessageReady(true);
        setTimeout(() => {
          setTyping(true);
        }, TYPING_DELAY);
      }
    } else {
      setMessageReady(true);
      setTyping(true);
    }

    if (typing || isVisible) {
      let currentIndex = 0;
      const messageInterval = setInterval(() => {
        setDisplayedMessage((prevMessage) => {
          let chunkSize = Math.min(
            CHUNK_SIZE,
            renderMessage.length - currentIndex
          );
          currentIndex += chunkSize;

          if (currentIndex <= renderMessage.length) {
            chunkSize = Math.min(
              CHUNK_SIZE,
              renderMessage.length - currentIndex
            );
            currentIndex += chunkSize;

            if (chatContainerRef.current) {
              const { scrollTop, clientHeight, scrollHeight } =
                chatContainerRef.current;

              if (scrollTop + clientHeight < scrollHeight) {
                setUserHasScrolledUp(true);
              } else {
                setUserHasScrolledUp(false);
              }

              // Only perform automatic scrolling if user has NOT scrolled up
              if (!userHasScrolledUp) {
                // calculate the distance to the end of the container
                const distanceFromBottom =
                  scrollHeight - scrollTop - clientHeight;

                // check if the user is near the end before performing automatic scrolling
                if (distanceFromBottom < SCROLL_BUFFER) {
                  chatContainerRef.current.scrollTo({
                    top: chatContainerRef.current.scrollHeight + SCROLL_BUFFER,
                  });
                }
              }
            }

            if (
              message.length >= MESSAGE_LENGTH_THRESHOLD &&
              currentIndex >= message.length - 1
            ) {
              setChatAvailable(true);
              setIsTypingChatbot(false);
            }

            return renderMessage.slice(0, currentIndex);
          } else {
            clearInterval(messageInterval);
            return prevMessage;
          }
        });
      }, TYPING_INTERVAL);

      return () => clearInterval(messageInterval);
    }
  }, [message, typing, isVisible, messageReady]);

  /* This useEffect hook is used to display a typing effect in the chatbot message.
  It is only activated once in the rendering of each Chatbot message to add a better User Experience. */
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (typingEffect) {
      timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
    } else {
      setIsVisible(true);
    }

    // add cleaning function to cancel the timer
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [typingEffect]);

  // define a function that will handle the copying of the text of the message to the clipboard.
  const handleCopyText = (message: string) => {
    navigator.clipboard.writeText(message);
    setCopiedText(true);
  };

  // reference to the chat container
  const { chatContainerRef } = useContext(ChatContext);

  // render the component with the following JSX elements.
  return (
    <div className="block">
      {/* render a div element that contains an image and the time the message was sent. */}
      {isVisible && (
        <div className="fade-in flex items-center justify-start gap-2">
          <img
            className="h-7"
            src={ETENDO_CHAT}
            alt={t(locale, "UserPicture")}
          />
          {featuresConfig.showMessageTime && (
            <h5 className="text-[0.9rem] text-gray-600">{time}</h5>
          )}
        </div>
      )}

      {/* render a div element that contains the text of the message. */}
      <div
        className={`${
          message.length <= 200 ? "flex" : ""
        } items-center justify-start gap-5`}
      >
        {!typing ? (
          typingEffect && <LoadingChatBotMessage messageReady={messageReady} />
        ) : (
          <div className={`${chatbotMessageStyles(darkMode, error)}`}>
            <ReactMarkdown
              children={typingEffect ? displayedMessage : message}
              className="leading-7"
              remarkPlugins={[remarkGfm]}
              components={{
                code: CodeComponent,
                p: (props) => (
                  <ParagraphComponent
                    {...props}
                    messageId={messageId}
                    error={error}
                  />
                ),
                a: AnchorComponent,
                li: ListItemComponent,
              }}
            />
          </div>
        )}
      </div>

      {!error && typing && (
        <div className="flex items-center justify-between">
          <div className="flex gap-5">
            {featuresConfig.showReformulate && (
              <div
                className="flex items-center gap-2 text-gray-600 hover:text-blue-700"
                onMouseEnter={() => setIsHoverReformulate(true)}
                onMouseLeave={() => setIsHoverReformulate(false)}
              >
                <img
                  className="h-3 cursor-pointer"
                  src={isHoverReformulate ? REFORMULATE_PURPLE : REFORMULATE}
                  alt={t(locale, "Reformulate")}
                />
                <p className="cursor-pointer text-sm">
                  {t(locale, "ReformulateAnswer")}
                </p>
              </div>
            )}

            <div
              className="flex items-center gap-1 text-gray-600 hover:text-blue-700"
              onClick={() => {
                setCopiedText(true);
                handleCopyText(message);
              }}
              onMouseEnter={() => setIsHoverCopy(true)}
              onMouseLeave={() => setIsHoverCopy(false)}
            >
              <img
                className="h-4 cursor-pointer"
                src={isHoverCopy || copiedText ? COPY_PURPLE : COPY}
                alt={t(locale, "Copy")}
              />
              <p
                className={`cursor-pointer text-sm ${
                  copiedText ? "text-blue-700" : ""
                }`}
              >
                {copiedText ? t(locale, "TextCopied") : t(locale, "CopyText")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotMessage;
