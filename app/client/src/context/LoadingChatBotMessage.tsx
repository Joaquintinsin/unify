import { createContext, useState } from "react";

interface IContextProps {
  loadingChatBotMessage: boolean;
  setLoadingChatBotMessage: ({ type }: any) => void;
}

export const LoadingChatBotMessageContext = createContext({} as IContextProps);

export const LoadingChatBotMessageProvider = ({ children }: any) => {
  const [loadingChatBotMessage, setLoadingChatBotMessage] =
    useState<boolean>(false);

  return (
    <LoadingChatBotMessageContext.Provider
      value={{ loadingChatBotMessage, setLoadingChatBotMessage }}
    >
      {children}
    </LoadingChatBotMessageContext.Provider>
  );
};
