/* Imports React & Next.js */
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

// Importing components, functions and context providers
import Popup from "@/src/components/popup";
import UserNavbar from "@/src/components/user-navbar";

import { ChatProvider } from "@/src/context/ScrollToBottom";
import { NewChatProvider } from "@/src/context/NewChatContext";
import { ChatLogProvider } from "@/src/context/ChatLogContext";
import { ShowPopupProvider } from "@/src/context/ShowPopupContext";
import { ThemeModeProvider } from "@/src/context/ThemeModeContext";
import { ChatSearchProvider } from "@/src/context/ChatSearchContext";
import { ChatHistoryProvider } from "@/src/context/ChatHistoryContext";
import { ConversationProvider } from "@/src/context/ConversationContext";
import { DeletedChatsProvider } from "@/src/context/DeletedChatsContext";
import { LoadingChatBotMessageProvider } from "@/src/context/LoadingChatBotMessage";

import { cleanMessage } from "@/src/utils/functions";
import t from "@/lang/locale";
import UserMessage from "@/src/components/chat/messages/user-message";
import ChatBotMessage from "@/src/components/chat/messages/chatbot-message";

// Array of context providers
const providers = [
  ChatLogProvider,
  NewChatProvider,
  DeletedChatsProvider,
  ChatSearchProvider,
  LoadingChatBotMessageProvider,
  ShowPopupProvider,
  ThemeModeProvider,
  ChatProvider,
  ConversationProvider,
  ChatHistoryProvider,
];

// Home function component
export default function Home() {
  // Next.js router
  const router = useRouter();
  const { locale } = useRouter();

  // use of contexts
  const [chatLog, setChatLog] = useState<any>([]);

  // funtction to sort by date
  const sortByDate = (firstDate: any, secondDate: any): number => {
    return (
      new Date(firstDate.time).getTime() - new Date(secondDate.time).getTime()
    );
  };

  // a function to fetch conversation data using API
  async function getConversationData(
    conversationId: string | string[] | undefined
  ): Promise<any> {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      if (conversationId) {
        const response = await fetch(
          `/api/conversation/${conversationId}`,
          requestOptions
        );
        let conversationMessages = JSON.parse(await response.json());

        conversationMessages = conversationMessages.sort(sortByDate);

        console;

        const newChatLog = conversationMessages.map((message: any) => ({
          message:
            message.role === "user"
              ? message.message
              : message.role === "assistant" && message.message,
          user:
            message.role === "user"
              ? "user"
              : message.role === "assistant"
              ? "chatbot"
              : "",
          conversationId: conversationId,
          messageId: message.messageId,
        }));

        setChatLog(newChatLog);
      }
    } catch (error) {
      console.error("error", error);
      throw error;
    }
  }

  useEffect(() => {
    // get id of the query
    const { id } = router.query;

    // if id is not available, return immediately
    if (!id) return;

    // call the function with the ID
    getConversationData(id);
  }, [router.query]);

  // wrapping the app with all the context providers
  const App = providers.reduceRight(
    (WrappedComponent, Provider) => {
      return <Provider>{WrappedComponent}</Provider>;
    },
    <>
      <Popup />
      <main className="relative min-h-screen">
        <UserNavbar />

        <div className="relative flex">
          <div className="relative min-h-[90vh] w-full bg-gray-500 py-10 px-12 dark:bg-black-800 lg:px-28">
            <div>
              <div>
                {chatLog?.map((message: any, index: number) => {
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
            </div>
          </div>
        </div>
      </main>
    </>
  );

  return App;
}
