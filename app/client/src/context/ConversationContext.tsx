import { createContext, useState } from "react";

interface IContextProps {
  conversationId: string;
  setConversationId: ({ type }: any) => void;
}

export const ConversationContext = createContext({} as IContextProps);

export const ConversationProvider = ({ children }: any) => {
  const [conversationId, setConversationId] = useState<string>("");

  return (
    <ConversationContext.Provider value={{ conversationId, setConversationId }}>
      {children}
    </ConversationContext.Provider>
  );
};
