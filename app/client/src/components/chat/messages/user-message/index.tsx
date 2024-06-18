import React from "react";
import { MessageProps } from "@/src/utils/types";
import { DEFAULT_USER } from "@/src/utils/constants";
import t from "@/lang/locale";
import { useRouter } from "next/router";
import { featuresConfig } from "@/src/utils/featuresConfig";

const UserMessage = ({ message, time }: any) => {
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
        <p className="user-message my-3 flex justify-end bg-gray-300 px-5 py-3 text-[0.95rem] text-gray-600 shadow-sm dark:bg-black-600">
          {message}
        </p>
      </div>
    </div>
  );
};

export default UserMessage;
