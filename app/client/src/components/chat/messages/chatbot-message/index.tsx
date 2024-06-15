import React from "react";
import { useRouter } from "next/router";
import { featuresConfig } from "@/src/utils/featuresConfig";
import { DEFAULT_USER } from "@/src/utils/constants";
import t from "@/lang/locale";

const ChatBotMessage = ({ message, time, options, type }: any) => {
  const { locale } = useRouter();

  return (
    <div className="slide-in block">
      <div className="flex items-center justify-end gap-2">
        <img
          className="flex h-7 w-7 items-center justify-center"
          src={DEFAULT_USER}
          alt={t(locale, "UserPicture")}
        />
        {featuresConfig.showMessageTime && (
          <h5 className="text-[0.9rem] text-gray-600">{time}</h5>
        )}
      </div>
      <div className="flex justify-end">
        <p className="user-message my-3 flex flex-col justify-start bg-white px-5 py-3 text-[0.95rem] text-gray-600 shadow-sm dark:bg-black-600">
          {message}
          {type === "quiz" && options && (
            <div className="flex flex-col items-start">
              {options.map((option: string, index: number) => (
                <button
                  key={index}
                  className="mt-2 bg-blue-500 text-black px-4 py-2 rounded"
                  onClick={() => console.log(`Selected: ${option}`)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </p>
      </div>
    </div>
  );
};

export default ChatBotMessage;