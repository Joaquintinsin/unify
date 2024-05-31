import React, { createContext, useState } from "react";
import { ChildrenProps } from "../utils/types";

interface IContextProps {
  showLikePopup: boolean;
  setShowLikePopup: (arg: boolean) => void;
  showDislikePopup: boolean;
  setShowDislikePopup: (arg: boolean) => void;
  messageId: string;
  setMessageId: ({ type }: any) => void;
  rating: string;
  setRating: ({ type }: any) => void;
}

export const ShowPopupContext = createContext({} as IContextProps);

export const ShowPopupProvider = ({ children }: ChildrenProps) => {
  const [showLikePopup, setShowLikePopup] = useState<boolean>(false);
  const [showDislikePopup, setShowDislikePopup] = useState<boolean>(false);
  const [messageId, setMessageId] = useState<string>("");
  const [rating, setRating] = useState<string>("");

  return (
    <ShowPopupContext.Provider
      value={{
        showLikePopup,
        setShowLikePopup,
        showDislikePopup,
        setShowDislikePopup,
        messageId,
        setMessageId,
        rating,
        setRating,
      }}
    >
      {children}
    </ShowPopupContext.Provider>
  );
};
