import { createContext, useState } from "react";

interface IContextProps {
  chatHistory: any;
  setChatHistory: ({ type }: any) => void;
  selectedChatIndex: number | null;
  setSelectedChatIndex: ({ type }: any) => void;
}

export const ChatHistoryContext = createContext({} as IContextProps);

export const ChatHistoryProvider = ({ children }: any) => {
  const [chatHistory, setChatHistory] = useState<any>(null);
  const [selectedChatIndex, setSelectedChatIndex] = useState<number | null>(
    null
  );

  return (
    <ChatHistoryContext.Provider
      value={{
        chatHistory,
        setChatHistory,
        selectedChatIndex,
        setSelectedChatIndex,
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
};
