
import React from "react";
import { useRouter } from "next/router";
import { BOTCITO } from "@/src/utils/constants";
import t from "@/lang/locale";

const ChatBotMessage = ({ message, time, options, onAnswer, score, total }: any) => {
  console.log("score", score)
  const { locale } = useRouter();

  const handleOptionClick = (option: any) => {
    onAnswer(option);
  };

  const getBackgroundColor = (score: number, total: number) => {
    const percentage = (score / total) * 10;
    if (percentage >= 0 && percentage <= 2) return "#ffb3ba";
    if (percentage >= 3 && percentage <= 5) return "#ffdfba";
    if (percentage >= 6 && percentage <= 7) return "#ffffba";
    if (percentage >= 8 && percentage <= 9) return "#baffc9";
    if (percentage === 10) return "#bae1ff";
    return "#ffffff";
  };


  return (
    <div className="slide-in block">
      <div className="flex items-center justify-end gap-2">
        <img
          className="flex h-10"
          src={BOTCITO}
          alt={t(locale, "UserPicture")}
        />
        {time && (
          <h5 className="text-[0.9rem] text-gray-600">{time}</h5>
        )}
      </div>
      <div className="flex justify-end">
        <div className="user-message my-3 flex flex-col justify-start px-5 py-3 text-[0.95rem] text-white shadow-sm" style={{ backgroundColor: getBackgroundColor(score, total) }}>
          <p className={`text-center font-medium py-1 px-2 text-blue-900 rounded ${score ? "bg-transparent text-black-700" : 'bg-yellow-300'}`}>{message}</p>
          <div className="mt-2 flex flex-col items-start">
            {options?.map((option: any, index: number) => (
              <button
                key={index}
                className="mt-1 w-full text-left text-black-900 text-[14px] px-4 py-2 rounded-3xl border border-gray-300
                         bg-white transition-colors duration-300 ease-in-out hover:bg-[#E5EFFF] hover:text-[#004ACA]"
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
