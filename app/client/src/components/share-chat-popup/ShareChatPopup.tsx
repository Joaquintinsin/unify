/* Imports */
import { useRouter } from "next/router";
import React, { useContext, useState } from "react";
import t from "@/lang/locale";

import { ThemeModeContext } from "@/src/context/ThemeModeContext";
import { ConversationContext } from "@/src/context/ConversationContext";
import { ShowShareChatPopupContext } from "@/src/context/ShowShareChatContext";

import {
  COPY,
  COPY_PURPLE,
  LINK_CONVERSATION,
  LINK_CONVERSATION_DARK,
  PUBLIC_URL,
  SHARE_CONVERSATION,
} from "@/src/utils/constants";

// render ShareChatPopup component
const ShareChatPopup = () => {
  // next router
  const { locale, pathname } = useRouter();

  // use context
  const { showShareChatPopup, setShowShareChatPopup } = useContext(
    ShowShareChatPopupContext
  );
  const { conversationId } = useContext(ConversationContext);
  const { darkMode } = useContext(ThemeModeContext);

  // use state
  const [copiedLinkToConversation, setCopiedLinkToConversation] =
    useState<boolean>(false);

  // link to the share the conversation
  const linkToConversation = `${PUBLIC_URL}${pathname}/${conversationId}`;

  // return null if the popup is not meant to be shown
  if (!showShareChatPopup) return null;

  // close the popup when clicking outside of it
  const handleClick = () => {
    if (copiedLinkToConversation) setCopiedLinkToConversation(false);
    setShowShareChatPopup(false);
  };

  // handle copying the link to the conversation
  const handleCopyLinkConversation = async () => {
    try {
      await navigator.clipboard.writeText(linkToConversation);
      setCopiedLinkToConversation(true);
    } catch (err) {
      console.error(t(locale, "CopyError"), err);
    }
  };

  return (
    <div
      className="absolute z-30 flex h-screen w-screen items-center justify-center bg-black-400"
      onClick={handleClick}
    >
      <div
        className="w-[28rem] rounded-2xl bg-white dark:bg-black-500 lg:w-[34rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center border-b border-gray-400 dark:border-black-800">
          <div className="flex items-center gap-8 p-7">
            <div className="w-full">
              <h3 className="text-lg font-medium text-blue-900 dark:text-white">
                {t(locale, "ShareThisConversation")}
              </h3>
              <p className="text-sm text-gray-600">
                {t(locale, "InviteToConversation")}
              </p>
            </div>
            <img
              className="h-20"
              src={SHARE_CONVERSATION}
              alt={t(locale, "ShareThisConversation")}
            />
          </div>
        </div>

        <div className="p-7 pt-5">
          <label className="block text-xs font-medium text-gray-600">
            {t(locale, "LinkOfConversation")}
          </label>
          <div className="relative mt-[0.35rem] flex w-full items-center justify-between gap-4 rounded-lg border-[1.5px] border-gray-400 px-3 dark:border-black-800">
            <p className="sm:text-sm w-3/4 overflow-hidden text-ellipsis whitespace-nowrap  py-2 text-[0.95rem] font-medium text-sky-500 focus:outline-none">
              {linkToConversation}
            </p>
            <div
              className="flex cursor-pointer items-center gap-1"
              onClick={handleCopyLinkConversation}
            >
              <img
                className="h-4"
                src={copiedLinkToConversation ? COPY_PURPLE : COPY}
                onClick={handleCopyLinkConversation}
                alt={t(locale, "Copy")}
              />
              <p
                className={`text-[0.8rem] ${
                  copiedLinkToConversation ? "text-blue-700" : "text-gray-700"
                }`}
              >
                {copiedLinkToConversation
                  ? t(locale, "Copied")
                  : t(locale, "Copy")}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <img
              className="h-12"
              src={darkMode ? LINK_CONVERSATION_DARK : LINK_CONVERSATION}
              alt={t(locale, "ConversationLink")}
            />

            <div>
              <h4 className="text font-medium text-blue-900 dark:text-white">
                {t(locale, "AnyoneWithLink")}
              </h4>
              <p className="text-[0.8rem] text-gray-600">
                {t(locale, "OnlyViewConversation")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareChatPopup;
