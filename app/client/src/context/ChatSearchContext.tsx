import { createContext, useState } from "react";

interface IContextProps {
  chatSearch: boolean;
  setChatSearch: ({ type }: any) => void;
  inputChatSearch: string;
  setInputChatSearch: ({ type }: any) => void;
  sortOrderChats: string;
  setSortOrderChats: ({ type }: any) => void;
}

export const ChatSearchContext = createContext({} as IContextProps);

export const ChatSearchProvider = ({ children }: any) => {
  const [chatSearch, setChatSearch] = useState<boolean>(false);
  const [inputChatSearch, setInputChatSearch] = useState<string>("");
  const [sortOrderChats, setSortOrderChats] = useState<"asc" | "desc">("desc");

  return (
    <ChatSearchContext.Provider
      value={{
        chatSearch,
        inputChatSearch,
        setChatSearch,
        setInputChatSearch,
        sortOrderChats,
        setSortOrderChats,
      }}
    >
      {children}
    </ChatSearchContext.Provider>
  );
};
