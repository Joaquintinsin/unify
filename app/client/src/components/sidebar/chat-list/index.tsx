/* Imports */
import React, { useContext, useEffect, useState } from "react";

// Importing components, utils, functions and contexts
import NewChat from "./new-chat";
import HistoricChat from "./historic-chat";
import LoadingHistoricChat from "./historic-chat/loading-historic-chat";

import { ChatSearchContext } from "@/src/context/ChatSearchContext";
import { ChatHistoryContext } from "@/src/context/ChatHistoryContext";
import { NewChatContext } from "@/src/context/NewChatContext";
import { ChatLogContext } from "@/src/context/ChatLogContext";
import { orderChats } from "@/src/utils/functions";
import { Chat } from "@/src/utils/interfaces";

const ChatList = () => {
  // Declare the time delay as a constant for easier adjustments
  let timeoutId: NodeJS.Timeout | null = null;
  const FETCH_DELAY = 2000;

  // Use states
  const [isDeletingChat, setIsDeletingChat] = useState<boolean>(false);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Using context and hooks for state management
  const { inputChatSearch } = useContext(ChatSearchContext);
  const {
    chatHistory,
    setChatHistory,
    selectedChatIndex,
    setSelectedChatIndex,
  } = useContext(ChatHistoryContext);
  const { newChatStarted } = useContext(NewChatContext);
  const { isTypingChatbot } = useContext(ChatLogContext);

  // function to fetch chat history
  async function getChatHistory(): Promise<any> {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch("/api/history", requestOptions);
      const chatsHistoric = JSON.parse(await response.json());

      // set the ordered chat history instead of setting it
      setChatHistory(orderChats(chatsHistoric));
    } catch (error) {
      console.error("error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // A function to delete a chat from the chat history
  const handleChatDeletion = (deletedChatId: string) => {
    setDeletingChatId(deletedChatId); // Set the ID of the chat being deleted
    // Create a new array that doesn't include the deleted chat
    const updatedChatHistory = chatHistory.filter(
      (chat: Chat) => chat.conversationId !== deletedChatId
    );

    // Update the chat history state with the new array
    setChatHistory(updatedChatHistory);
  };

  // Fetching chat history when a new chat is started or when the authorization code changes
  useEffect(() => {
    // Waiting for the code to be updated by Keycloak before fetching conversations
    if (newChatStarted || !isTypingChatbot) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Setting a timeout to wait before fetching chat history
      timeoutId = setTimeout(() => {
        getChatHistory();
      }, FETCH_DELAY);
    }

    // Clear the timeout if the component is unmounted
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [newChatStarted, isTypingChatbot]);

  // Filtering chat history based on the search string
  const getFilteredChatHistory = (chatHistory: any[], searchString: string) => {
    if (!chatHistory) {
      return null;
    }

    const normalizedSearchString = searchString.toLowerCase();

    return chatHistory.filter((chat: any) => {
      const chatTitle = chat.title;

      if (!chatTitle) {
        return false;
      }

      const normalizedChatTitle = chatTitle.toLowerCase();
      return normalizedChatTitle.includes(normalizedSearchString);
    });
  };

  const filteredChatHistory = getFilteredChatHistory(
    chatHistory,
    inputChatSearch
  );

  return (
    <div className="w-full">
      <div className="border-t border-gray-300 dark:border-black-800">
        <NewChat />
      </div>
      <div className={`${filteredChatHistory && "chat-list-container"}`}>
        {filteredChatHistory
          ? filteredChatHistory.map((chat: any, index: number) => {
            return (
              <HistoricChat
                key={chat.conversationId}
                index={index}
                chat={chat}
                selectedChatIndex={selectedChatIndex}
                setSelectedChatIndex={setSelectedChatIndex}
                handleChatDeletion={handleChatDeletion}
                isDeletingChat={isDeletingChat}
                setIsDeletingChat={setIsDeletingChat}
                deletingChatId={deletingChatId}
                setDeletingChatId={setDeletingChatId}
              />
            );
          })
          : loading && Array.from({ length: 5 }, (_, index) => (
            <LoadingHistoricChat key={index} />
          ))}
      </div>
    </div>
  );
};

export default ChatList;
