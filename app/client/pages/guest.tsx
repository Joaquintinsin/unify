/* Imports React & Next.js */
import { useEffect, useState } from "react";
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

import { ShowShareChatPopupProvider } from "@/src/context/ShowShareChatContext";
import { ShowSubscriptionToVersionPremiumProvider } from "@/src/context/ShowSubscriptionToVersionPremiumPopupContext";
import SubscriptionToVersionPremiumPopup from "@/src/components/subscription-to-premium-version-popup/SubscriptionToVersionPremiumPopup";

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
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    const fetchGuestToken = async () => {
      try {
        const response = await fetch("/api/guest-user-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // if you need to send a body, do it here
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json(); // Assuming your response needs to be parsed as JSON

        if (data.ok) {
          console.log("Token fetched successfully");
        } else {
          console.log("Failed to fetch token");
        }
      } catch (error) {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        );
      }
    };

    if (isGuest) {
      // or another condition to decide when to fetch the token
      fetchGuestToken();
    }
  }, [isGuest]); // or other dependencies

  // Wrapping the app with all the context providers
  const App = providers.reduceRight(
    (WrappedComponent, Provider) => {
      return <Provider>{WrappedComponent}</Provider>;
    },
    <>
      <Popup />
      <ShareChatPopup />
      <SubscriptionToVersionPremiumPopup />

      <main className="relative h-screen w-screen overflow-hidden">
        <UserNavbar isGuest={isGuest} />

        <div className="relative flex h-[90%]">
          <Sidebar isGuest={isGuest} />
          <Chat />
        </div>
      </main>
    </>
  );

  // Returning the wrapped app
  return App;
}
