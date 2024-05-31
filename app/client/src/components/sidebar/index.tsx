/* Imports */
import React from "react";

import FilterChats from "./filter-chats";
import ChatList from "./chat-list";
import DeleteChats from "./delete-chats";

import { IsGuestProps } from "@/src/utils/interfaces";

const Sidebar = () => {
  return (
    <div className="hidden h-full w-[30%] flex-col border-r border-gray-400 bg-white dark:border-black-800 dark:bg-black-700 md:flex">
      <FilterChats />
      <ChatList />
      <DeleteChats />
    </div>
  );
};

export default Sidebar;
