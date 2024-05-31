import { createContext, useState } from "react";

interface IContextProps {
  chatLog: Array<string>;
  setChatLog: ({ type }: any) => void;
  typingEffect: boolean;
  setTypingEffect: ({ type }: any) => void;
  chatAvailable: boolean;
  setChatAvailable: ({ type }: any) => void;
  isTypingChatbot: boolean;
  setIsTypingChatbot: ({ type }: any) => void;
}

export const ChatLogContext = createContext({} as IContextProps);

export const ChatLogProvider = ({ children }: any) => {
  const [chatLog, setChatLog] = useState<Array<string> | []>([]);
  const [typingEffect, setTypingEffect] = useState<boolean>(false);
  const [chatAvailable, setChatAvailable] = useState<boolean>(true);
  const [isTypingChatbot, setIsTypingChatbot] = useState<boolean>(false);

  return (
    <ChatLogContext.Provider
      value={{
        chatLog,
        setChatLog,
        typingEffect,
        setTypingEffect,
        chatAvailable,
        setChatAvailable,
        isTypingChatbot,
        setIsTypingChatbot,
      }}
    >
      {children}
    </ChatLogContext.Provider>
  );
};
