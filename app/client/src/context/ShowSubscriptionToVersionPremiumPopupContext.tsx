import React, { createContext, useState } from "react";
import { ChildrenProps } from "../utils/types";

interface IContextProps {
  showSubscriptionToVersionPremium: boolean;
  setShowSubscriptionToVersionPremium: ({ type }: any) => void;
}

export const ShowSubscriptionToVersionPremiumPopupContext = createContext(
  {} as IContextProps
);

export const ShowSubscriptionToVersionPremiumProvider = ({
  children,
}: ChildrenProps) => {
  const [
    showSubscriptionToVersionPremium,
    setShowSubscriptionToVersionPremium,
  ] = useState<boolean>(false);

  return (
    <ShowSubscriptionToVersionPremiumPopupContext.Provider
      value={{
        showSubscriptionToVersionPremium,
        setShowSubscriptionToVersionPremium,
      }}
    >
      {children}
    </ShowSubscriptionToVersionPremiumPopupContext.Provider>
  );
};
