import { BOT, GREEN_CHECK } from "@/src/utils/constants";
import React, { useEffect, useState } from "react";
import t from "@/lang/locale";

import { useRouter } from "next/router";
import Image from "next/image";

// Define a functional component called LoadingChatBotMessage that takes in a prop called messageReady.
const LoadingChatBotMessage = ({ messageReady }: any) => {
  // Get the current locale using the useRouter hook.
  const { locale } = useRouter();
  /* Declare states */
  // Define an array of messages to display while the chat bot is searching for a response.
  const searchingMessages = [
    t(locale, "SearchingResults"),
    t(locale, "TrackingInformation"),
    t(locale, "ReviewingSources"),
    t(locale, "InvestigatingAnswer"),
    t(locale, "ExploringData"),
  ];
  const [isVisible, setIsVisible] = useState(false);
  const [randomSearchMessage, setRandomSearchMessage] = useState(
    searchingMessages[Math.floor(Math.random() * searchingMessages.length)]
  );

  // define an effect to make the loading message visible after 1.5 seconds.
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [messageReady, isVisible]);

  useEffect(() => {
    // choose a random search message from the searchingMessages array.
    const intervalId = setInterval(() => {
      const newRandomSearchMessage =
        searchingMessages[Math.floor(Math.random() * searchingMessages.length)];
      setRandomSearchMessage(newRandomSearchMessage);
    }, 4500);
    return () => clearInterval(intervalId);
  }, [searchingMessages]);

  // Render the component with the following JSX elements.
  return (
    <>
      {/* If isVisible is true, render the loading message. */}
      {isVisible && (
        <>
          <div className="slide-in flex items-center gap-3">
            {/* Render an image of the chat bot. */}
            <div
              className={`flex items-center ${!messageReady ? "etendo-bot h-10 w-10" : "h-6 w-6"
                } relative`}
            >
              <img
                src={!messageReady ? BOT : GREEN_CHECK}
                alt={t(locale, "EtendoBot")}
                className="w-full"
              />
            </div>

            {/* Render a message to indicate that the chat bot is searching for a response. */}
            <p className="my-3 py-3 text-[0.9rem] font-medium text-gray-700 dark:text-white">
              {!messageReady
                ? randomSearchMessage
                : t(locale, "Ready! Generating response:")}
            </p>
          </div>
        </>
      )}
    </>
  );
};

// Export the LoadingChatBotMessage component as the default export of this module.
export default LoadingChatBotMessage;
