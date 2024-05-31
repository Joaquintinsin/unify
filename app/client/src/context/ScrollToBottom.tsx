import React, { createContext, useRef } from "react";

interface ChatContextProps {
  chatContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const ChatContext = createContext({} as ChatContextProps);

export const ChatProvider = ({ children }: any) => {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <ChatContext.Provider value={{ chatContainerRef }}>
      {children}
    </ChatContext.Provider>
  );
};
