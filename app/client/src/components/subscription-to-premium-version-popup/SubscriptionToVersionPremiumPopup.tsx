/* Imports */
import { useRouter } from "next/router";
import React, { useContext } from "react";
import t from "@/lang/locale";

import { ThemeModeContext } from "@/src/context/ThemeModeContext";
import { ShowSubscriptionToVersionPremiumPopupContext } from "@/src/context/ShowSubscriptionToVersionPremiumPopupContext";

import {
  LIMIT_NUMBER_STANDARD_CONVERSATIONS,
  SUBSCRIPTION_TO_VERSION_PREMIUM,
  SUBSCRIPTION_TO_VERSION_PREMIUM_DARK,
} from "@/src/utils/constants";

// render SubscriptionToVersionPremiumPopup component
const SubscriptionToVersionPremiumPopup = () => {
  // next router
  const { locale } = useRouter();

  // use context
  const {
    showSubscriptionToVersionPremium,
    setShowSubscriptionToVersionPremium,
  } = useContext(ShowSubscriptionToVersionPremiumPopupContext);
  const { darkMode } = useContext(ThemeModeContext);

  // return null if the popup is not meant to be shown
  if (!showSubscriptionToVersionPremium) return null;

  // close the popup when clicking outside of it
  const closePopup = () => {
    setShowSubscriptionToVersionPremium(false);
  };

  return (
    <div
      className="absolute z-30 flex h-screen w-screen items-center justify-center bg-black-400"
      onClick={closePopup}
    >
      <div
        className="w-[30rem] flex-col rounded-2xl bg-white p-8 dark:bg-black-500"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center">
            <img
              className="h-24"
              src={
                darkMode
                  ? SUBSCRIPTION_TO_VERSION_PREMIUM_DARK
                  : SUBSCRIPTION_TO_VERSION_PREMIUM
              }
              alt={t(locale, "UpgradeToPremium")}
            />
          </div>
          <h2 className="mt-1 text-lg font-semibold text-blue-900 dark:text-white">
            {t(locale, "UpgradeToPremium")}
          </h2>
          <p className="mt-1 text-center text-sm text-gray-600">
            {`${t(
              locale,
              "UpgradeToPremiumAccess"
            )} ${LIMIT_NUMBER_STANDARD_CONVERSATIONS} ${t(
              locale,
              "Conversations"
            )}`}
          </p>

          <button
            onClick={closePopup}
            className="mt-5 rounded-3xl bg-blue-800 py-[0.4rem] px-6 text-white shadow"
          >
            {t(locale, "Understood")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionToVersionPremiumPopup;
