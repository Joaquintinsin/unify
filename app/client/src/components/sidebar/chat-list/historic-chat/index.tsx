/* Imports */
import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import t from "@/lang/locale";

import { ChatLogContext } from "@/src/context/ChatLogContext";
import { ConversationContext } from "@/src/context/ConversationContext";
import { NewChatContext } from "@/src/context/NewChatContext";
import { ThemeModeContext } from "@/src/context/ThemeModeContext";
import {
  convertDate,
  handleSwitchMode,
  capitalize,
} from "@/src/utils/functions";

import {
  PATCH,
  FAVORITE,
  FAVORITE_ACTIVE,
  FAVORITE_DARK,
  SHARE,
  SHARE_DARK,
  BLUE_TRASH,
  TRASH_DARK,
  WHITE_CHECK,
  BLUE_CHECK,
  WHITE_CLOSE,
  BLUE_CLOSE,
} from "@/src/utils/constants";
import { ShowShareChatPopupContext } from "@/src/context/ShowShareChatContext";
import LoadingHistoricChat from "./loading-historic-chat";

// Defining the HistoricChat component
const HistoricChat = ({
  index,
  chat,
  selectedChatIndex,
  setSelectedChatIndex,
  handleChatDeletion,
  isDeletingChat,
  setIsDeletingChat,
  deletingChatId,
  setDeletingChatId,
}: any) => {
  // next router
  const { locale } = useRouter();

  // state variable to indicate if a chat is a favorite
  const [toBeDeleted, setToBeDeleted] = useState(false);
  const [isFavouriting, setIsFavouriting] = useState(false);
  const [favouriteChat, setFavouriteChat] = useState<boolean>(chat.favourite);

  // useContext
  const { darkMode, setDarkMode } = useContext(ThemeModeContext);
  const { setShowShareChatPopup } = useContext(ShowShareChatPopupContext);

  // switching the theme mode
  handleSwitchMode(setDarkMode);

  // using context hooks to access values from other components
  const { setChatLog, typingEffect, setTypingEffect } =
    useContext(ChatLogContext);
  const { setConversationId } = useContext(ConversationContext);
  const { setNewChat } = useContext(NewChatContext);

  // order chats by date from the most rect to the oldest
  interface DateObject {
    time: string;
  }

  const sortByDate = (
    firstDate: DateObject,
    secondDate: DateObject
  ): number => {
    return (
      new Date(firstDate.time).getTime() - new Date(secondDate.time).getTime()
    );
  };

  // A function to fetch conversation data using API
  async function getConversationData(conversationId: string): Promise<any> {
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

        const chatLog = conversationMessages.map((message: any) => ({
          message:
            message.role === "user"
              ? message.message
              : message.role === "assistant" &&
                message.message + ` ## ${t(locale, "ThisAnswerHelpful")}`,
          user:
            message.role === "user"
              ? "user"
              : message.role === "assistant"
              ? "chatbot"
              : "",
          conversationId: conversationId,
          messageId: message.messageId,
        }));

        setChatLog(chatLog);
      }
    } catch (error) {
      console.error("error", error);
      throw error;
    }
  }

  // function to handle click event on the chat card
  function handleCardClick(index: number) {
    setNewChat(false);
    setChatLog([]);
    setConversationId(chat.conversationId);

    if (typingEffect) {
      setTypingEffect(false);
    }
    document.getElementsByClassName("hover:bg-gray-200")[index].click();
    setSelectedChatIndex(index);

    // call to getConversationData directly in the onClick event
    getConversationData(chat.conversationId);
  }

  const handleDeleteConversation = async (
    event: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setIsDeletingChat(true);
    setDeletingChatId(chat.conversationId); // Set the ID of the chat being deleted

    const requestOptions = {
      method: PATCH,
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      await fetch(
        `/api/delete-conversation/${chat.conversationId}`,
        requestOptions
      );
      handleChatDeletion(chat.conversationId); // Call the callback function to delete the chat from the chat history
    } catch (error) {
      console.error("Failed to delete conversation", error);
    } finally {
      setIsDeletingChat(false); // Set loading back to false when deletion ends
    }
  };
  const handleFavoriteConversation = async (
    event: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    if (isFavouriting) return;

    setIsFavouriting(true);
    event.stopPropagation();
    setFavouriteChat(!favouriteChat);

    const requestOptions = {
      method: PATCH,
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      await fetch(
        `/api/favourite-conversation/${chat.conversationId}`,
        requestOptions
      );
    } finally {
      setIsFavouriting(false);
    }
  };

  if (isDeletingChat && chat.conversationId === deletingChatId) {
    return <LoadingHistoricChat />;
  }

  return (
    <div
      className={`border-r-[3px] ${
        selectedChatIndex === index ? "border-r-blue-700" : "border-transparent"
      } flex cursor-pointer flex-col items-center border-b border-b-gray-300 py-4 pl-8 pr-7 hover:bg-gray-200 dark:border-b-black-800 dark:bg-black-500 dark:hover:bg-black-600`}
      onClick={() => handleCardClick(index)}
    >
      <div className="mb-[0.4rem] flex w-full items-center justify-between">
        <h3 className="overflow-text w-[85%] overflow-hidden text-[1.025rem] font-medium text-blue-900 dark:text-white">
          {!toBeDeleted
            ? capitalize(chat.title)
            : `${t(locale, "Remove?")} "${capitalize(chat.title)}"?`}
        </h3>

        <div className="flex items-center gap-2">
          <img
            className={`h-4 w-4 ${
              favouriteChat ? "" : "hover:brightness-200"
            } ${isFavouriting ? "cursor-default" : "cursor-pointer"}`}
            src={
              favouriteChat
                ? FAVORITE_ACTIVE
                : darkMode
                ? FAVORITE_DARK
                : FAVORITE
            }
            alt={t(locale, "Favorite")}
            onClick={(event) =>
              !isFavouriting && handleFavoriteConversation(event)
            }
          />
          {!toBeDeleted ? (
            <img
              className="h-4 w-4 hover:brightness-200"
              onClick={(e) => {
                e.stopPropagation();
                setShowShareChatPopup(true);
                setConversationId(chat.conversationId);
              }}
              src={darkMode ? SHARE_DARK : SHARE}
              alt={t(locale, "ShareThisConversation")}
            />
          ) : (
            <img
              className="h-4 w-4 hover:brightness-200"
              onClick={(event) => handleDeleteConversation(event)}
              src={darkMode ? WHITE_CHECK : BLUE_CHECK}
              alt={t(locale, "Accept")}
            />
          )}
          {!toBeDeleted ? (
            <img
              className="h-4 w-4 hover:brightness-200"
              src={darkMode ? TRASH_DARK : BLUE_TRASH}
              alt={t(locale, "Trash")}
              onClick={(event) => {
                event.stopPropagation();
                setToBeDeleted(true);
              }}
            />
          ) : (
            <img
              className="h-4 w-4 hover:brightness-200"
              src={darkMode ? WHITE_CLOSE : BLUE_CLOSE}
              alt={t(locale, "Close")}
              onClick={(event) => {
                event.stopPropagation();
                setToBeDeleted(false);
              }}
            />
          )}
        </div>
      </div>
      <div className="flex w-full items-center justify-between">
        <h5 className="text-[0.825rem] text-gray-600">
          {convertDate(chat.creationDate)}
        </h5>
      </div>
    </div>
  );
};

export default HistoricChat;
