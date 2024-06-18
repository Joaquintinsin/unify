/* Imports React & Next.js */
import { useEffect, useState, useRef, useContext } from "react";
import { useRouter } from "next/router";

// Importing components, functions and context providers
import Chat from "@/src/components/chat";
import Popup from "@/src/components/popup";
import Sidebar from "@/src/components/sidebar";
import UserNavbar from "@/src/components/user-navbar";
import ShareChatPopup from "@/src/components/share-chat-popup/ShareChatPopup";

import { ChatProvider } from "@/src/context/ScrollToBottom";
import { NewChatProvider } from "@/src/context/NewChatContext";
import { ChatLogProvider } from "@/src/context/ChatLogContext";
import { ShowPopupProvider } from "@/src/context/ShowPopupContext";
import { ThemeModeProvider } from "@/src/context/ThemeModeContext";
import { ChatSearchProvider } from "@/src/context/ChatSearchContext";
import { ChatHistoryProvider } from "@/src/context/ChatHistoryContext";
import { ConversationProvider } from "@/src/context/ConversationContext";
import { DeletedChatsProvider } from "@/src/context/DeletedChatsContext";
import { LoadingChatBotMessageProvider } from "@/src/context/LoadingChatBotMessage";

import { getBrowserLanguage } from "@/src/utils/functions";
import { getAuthorizationCode } from "@/src/utils/functions";
import { ShowShareChatPopupProvider } from "@/src/context/ShowShareChatContext";
import { ShowSubscriptionToVersionPremiumProvider } from "@/src/context/ShowSubscriptionToVersionPremiumPopupContext";
import SubscriptionToVersionPremiumPopup from "@/src/components/subscription-to-premium-version-popup/SubscriptionToVersionPremiumPopup";
import SectionChat from "@/src/components/chat/section-chat";

// Array of context providers
const providers = [
  ChatLogProvider,
  NewChatProvider,
  DeletedChatsProvider,
  ChatSearchProvider,
  LoadingChatBotMessageProvider,
  ShowPopupProvider,
  ShowShareChatPopupProvider,
  ShowSubscriptionToVersionPremiumProvider,
  ThemeModeProvider,
  ChatProvider,
  ConversationProvider,
  ChatHistoryProvider,
];

// Home function component
export default function Home() {
  const App = providers.reduceRight(
    (WrappedComponent, Provider) => {
      return <Provider>{WrappedComponent}</Provider>;
    },
    <>
      <Popup />
      <ShareChatPopup />
      <SubscriptionToVersionPremiumPopup />

      <main className="relative h-screen w-screen bg-gray-500">
        <div className="fixed top-0 w-full z-50">
          <UserNavbar />
        </div>
        <div className="pt-24">
          <SectionChat />
        </div>
      </main>

    </>
  );

  return App;
}
