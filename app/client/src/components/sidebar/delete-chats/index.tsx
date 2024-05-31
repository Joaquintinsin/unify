/* Imports React & Next.js */
import React, { useContext, useState } from "react";
import { useRouter } from "next/router";

// Importing utils, translations, functions and context providers
import t from "@/lang/locale";
import {
  OK,
  PATCH,
  BLUE_TRASH,
  TRASH_DARK,
  WHITE_CHECK,
  BLUE_CHECK,
} from "@/src/utils/constants";
import { handleSwitchMode } from "@/src/utils/functions";

import { ChatLogContext } from "@/src/context/ChatLogContext";
import { NewChatContext } from "@/src/context/NewChatContext";
import { ThemeModeContext } from "@/src/context/ThemeModeContext";
import { ChatHistoryContext } from "@/src/context/ChatHistoryContext";
import { DeletedChatsContext } from "@/src/context/DeletedChatsContext";
import { ConversationContext } from "@/src/context/ConversationContext";
import LoadingSpinner from "../chat-list/spinner";

// DeleteChats function component
const DeleteChats = () => {
  // Next.js locale
  const { locale } = useRouter();

  // use state
  const [toBeDeletedAllConversations, setToDeletedAllConversations] =
    useState(false);
  const [isLoadingDeletingConversations, setIsLoadingDeletingConversations] =
    useState(false);

  // use context
  const { setChatLog } = useContext(ChatLogContext);
  const { setNewChat } = useContext(NewChatContext);
  const { setChatHistory } = useContext(ChatHistoryContext);
  const { setDeletedChats } = useContext(DeletedChatsContext);
  const { setConversationId } = useContext(ConversationContext);
  const { darkMode, setDarkMode } = useContext(ThemeModeContext);

  // switch theme mode
  handleSwitchMode(setDarkMode);

  /* This function handles the deletion of conversations by making a PATCH request to the delete-conversations API.
  If the deletion is successful, it clears the chat history, chat log and resets the chat search state. */
  const handleDeleteConversations = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // Prevent event propagation
    event.stopPropagation();

    if (toBeDeletedAllConversations) {
      // Delete all conversations when toBeDeletedAllConversations is true
      setIsLoadingDeletingConversations(true); // Set loading to true when deletion starts

      // Define request options for the API call
      const requestOptions = {
        method: PATCH,
        headers: {
          "Content-Type": "application/json",
        },
      };

      // Fetch to the API call to delete conversations
      const response = await fetch(`/api/delete-conversations`, requestOptions);

      // If the response status is OK, clear chat history and chat log,
      if (response.status === OK) {
        setChatLog([]);
        setChatHistory([]);
        setNewChat(true);
        setDeletedChats(false);
        setConversationId("");
      }

      // Restore toBeDeletedAllConversations and loading to false
      setToDeletedAllConversations(false);
      setIsLoadingDeletingConversations(false);
    } else {
      // First click, set toBeDeletedAllConversations to true
      setToDeletedAllConversations(true);
    }
  };

  // Component to manage the logic of the delete icon
  const DeleteIcon: React.FC<{
    toBeDeleted: boolean;
    darkMode: boolean;
  }> = ({ toBeDeleted, darkMode }) => {
    if (toBeDeleted) {
      // Show the confirm delete icon
      return (
        <img
          className="h-4 w-4"
          src={darkMode ? WHITE_CHECK : BLUE_CHECK}
          alt="Confirm Delete"
        />
      );
    }

    // Show the trash icon
    return (
      <img
        className="h-4 w-4"
        src={darkMode ? TRASH_DARK : BLUE_TRASH}
        alt="Delete"
      />
    );
  };

  // Get the display text for the delete chats button
  const getDisplayTextDeleteAllConversations = (
    isLoadingDeletingConversations: boolean,
    toBeDeletedAllConversations: boolean,
    locale: string | undefined
  ): string => {
    if (isLoadingDeletingConversations) {
      return t(locale, "DeletingAllConversations");
    }

    return toBeDeletedAllConversations
      ? t(locale, "ConfirmsToDeleteAllConversations")
      : t(locale, "DeleteConversations");
  };

  return (
    <div className="absolute bottom-0 z-20 mt-4 flex w-[23.025%] cursor-pointer items-center gap-[0.9rem] border-t border-b border-gray-300 bg-white px-4 py-2 dark:border-black-800 dark:bg-black-500">
      <div
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition duration-700 hover:bg-blue-200 dark:border-black-800 dark:hover:bg-black-600"
        onClick={(event) => handleDeleteConversations(event)}
      >
        {isLoadingDeletingConversations ? (
          <LoadingSpinner />
        ) : (
          <DeleteIcon
            toBeDeleted={toBeDeletedAllConversations}
            darkMode={darkMode}
          />
        )}
        <p className="w-full truncate text-sm dark:text-gray-400">
          {getDisplayTextDeleteAllConversations(
            isLoadingDeletingConversations,
            toBeDeletedAllConversations,
            locale
          )}
        </p>
      </div>
    </div>
  );
};

export default DeleteChats;
