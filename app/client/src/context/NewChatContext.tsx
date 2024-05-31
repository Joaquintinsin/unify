import { createContext, useState } from "react";

interface IContextProps {
  newChat: boolean;
  setNewChat: ({ type }: any) => void;
  newChatStarted: boolean;
  setNewChatStarted: ({ type }: any) => void;
}

export const NewChatContext = createContext({} as IContextProps);

export const NewChatProvider = ({ children }: any) => {
  const [newChat, setNewChat] = useState<boolean>(false);
  const [newChatStarted, setNewChatStarted] = useState<boolean>(false);

  return (
    <NewChatContext.Provider
      value={{ newChat, setNewChat, newChatStarted, setNewChatStarted }}
    >
      {children}
    </NewChatContext.Provider>
  );
};
