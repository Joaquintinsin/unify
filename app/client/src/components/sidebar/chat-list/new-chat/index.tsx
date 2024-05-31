/* Imports */
import { useRouter } from "next/router";
import React, { useContext } from "react";

import t from "@/lang/locale";
import { ChatLogContext } from "@/src/context/ChatLogContext";
import { ChatSearchContext } from "@/src/context/ChatSearchContext";
import { ConversationContext } from "@/src/context/ConversationContext";
import { DeletedChatsContext } from "@/src/context/DeletedChatsContext";
import { NewChatContext } from "@/src/context/NewChatContext";
import { ThemeModeContext } from "@/src/context/ThemeModeContext";
import { NEW_CHAT, NEW_CHAT_DARK } from "@/src/utils/constants";
import { handleSwitchMode } from "@/src/utils/functions";
import { ChatHistoryContext } from "@/src/context/ChatHistoryContext";

const NewChat = () => {
  // get the current locale from the router
  const { locale } = useRouter();

  // get the necessary context states and functions using useContext
  const { setChatLog } = useContext(ChatLogContext);
  const { setNewChat } = useContext(NewChatContext);
  const { setDeletedChats } = useContext(DeletedChatsContext);
  const { setInputChatSearch, setChatSearch } = useContext(ChatSearchContext);
  const { setConversationId } = useContext(ConversationContext);
  const { darkMode, setDarkMode } = useContext(ThemeModeContext);
  const { setSelectedChatIndex } = useContext(ChatHistoryContext);

  // call handleSwitchMode with setDarkMode as the argument to toggle the mode
  handleSwitchMode(setDarkMode);

  // return the JSX for the NewChat component
  return (
    <div
      onClick={() => {
        // reset all the context states when a new chat is created
        setChatLog([]);
        setNewChat(true);
        setDeletedChats(false);
        setChatSearch(false);
        setInputChatSearch("");
        setConversationId("");
        setSelectedChatIndex(null);
      }}
      // add styling to the component
      className="flex w-full cursor-pointer items-center gap-[0.9rem] border-b border-gray-300 bg-white px-4 py-2 dark:border-black-800 dark:bg-black-500"
    >
      <div
        // call a function to reset the chat and conversation states when a new chat is clicked
        onClick={() => {
          setChatLog([]);
          setNewChat(true);
          setDeletedChats(false);
          setChatSearch(false);
          setInputChatSearch("");
          setConversationId("");
        }}
        // add styling to the inner div of the component
        className="flex w-full cursor-pointer items-center gap-[0.9rem] rounded-lg px-4 py-3 transition duration-700 hover:bg-blue-200 dark:border-black-800 dark:hover:bg-black-600"
      >
        <img
          // set the source of the image depending on the dark mode
          className="h-7 "
          src={darkMode ? NEW_CHAT_DARK : NEW_CHAT}
          alt={t(locale, "NewChat")}
        />
        <h2 className="text-[1.05rem] font-medium text-blue-900 dark:text-gray-400">
          {t(locale, "NewChat")}
        </h2>
      </div>
    </div>
  );
};

export default NewChat;
