import React, { createContext, useState } from "react";
import { ChildrenProps } from "../utils/types";

interface IContextProps {
  showShareChatPopup: boolean;
  setShowShareChatPopup: ({ type }: any) => void;
}

export const ShowShareChatPopupContext = createContext({} as IContextProps);

export const ShowShareChatPopupProvider = ({ children }: ChildrenProps) => {
  const [showShareChatPopup, setShowShareChatPopup] = useState<boolean>(false);

  return (
    <ShowShareChatPopupContext.Provider
      value={{
        showShareChatPopup,
        setShowShareChatPopup,
      }}
    >
      {children}
    </ShowShareChatPopupContext.Provider>
  );
};
