import React from "react";
import { useRouter } from "next/router";
import { DEFAULT_USER } from "@/src/utils/constants";
import t from "@/lang/locale";

const ChatBotMessage = ({ message, time, options, type, onAnswer }) => {
  const { locale } = useRouter();
  console.log("ChatBotMessage -> locale", locale)
  console.log("ChatBotMessage -> message", message)
  console.log("ChatBotMessage -> time", time)
  console.log("ChatBotMessage -> options", options)

  // Function to handle click on quiz options
  const handleOptionClick = (option) => {
    // Call the provided onAnswer function with the selected option
    onAnswer(option);
  };

  return (
    <div className="slide-in block">
      <div className="flex items-center justify-end gap-2">
        <img
          className="flex h-7 w-7 items-center justify-center"
          src={DEFAULT_USER}
          alt={t(locale, "UserPicture")}
        />
        {time && (
          <h5 className="text-[0.9rem] text-gray-600">{time}</h5>
        )}
      </div>
      <div className="flex justify-end">
        <div className="user-message my-3 flex flex-col justify-start bg-white px-5 py-3 text-[0.95rem] text-gray-600 shadow-sm dark:bg-black-600">
          <p>{message}</p>
          <div className="mt-2 flex flex-col items-start">
            {options?.map((option, index) => (
              <button
                key={index}
                className="mt-1 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotMessage;
