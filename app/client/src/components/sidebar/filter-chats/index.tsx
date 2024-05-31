import t from "@/lang/locale";
import React, { useContext, useState } from "react";
import { ChatSearchContext } from "@/src/context/ChatSearchContext";
import { ThemeModeContext } from "@/src/context/ThemeModeContext";
import { ARROW_BOTTOM, ARROW_BOTTOM_DARK, SEARCH } from "@/src/utils/constants";
import { useRouter } from "next/router";
import { featuresConfig } from "@/src/utils/featuresConfig";

const FilterChats = () => {
  const { locale } = useRouter();
  const { setChatSearch, inputChatSearch, setInputChatSearch } =
    useContext(ChatSearchContext);
  const [filterRecentChats, setFilterRecentChats] = useState(true);

  const { darkMode } = useContext(ThemeModeContext);

  return (
    <div className="w-full px-8 py-4">
      <div className="relative flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <div className="text-[2rem] font-bold text-blue-900 dark:text-white">
            {t(locale, "Chats")}
          </div>

          {featuresConfig.showOrderChats && (
            <div className="absolute right-0 top-0  flex flex-col items-end justify-end">
              <p className="text-end text-[0.75rem] font-medium text-gray-800 dark:text-gray-800">
                {t(locale, "OrderBy")}:
              </p>

              <div
                className="flex cursor-pointer items-center gap-2"
                onClick={() => setFilterRecentChats(!filterRecentChats)}
              >
                <h5 className="text-[0.95rem] font-medium text-gray-700 dark:text-white">
                  {filterRecentChats ? "Recents" : "Olds"}
                </h5>
                <img
                  className={`flex h-2 ${
                    filterRecentChats ? "" : "rotate-180 transform"
                  }`}
                  src={darkMode ? ARROW_BOTTOM_DARK : ARROW_BOTTOM}
                  alt={t(locale, "EtendoLogotype")}
                />
              </div>
            </div>
          )}
        </div>

        <div className="w-full">
          <div className="relative flex items-center">
            <img
              className="absolute left-4 mr-3 h-[0.8rem]"
              src={SEARCH}
              alt={t(locale, "EtendoLogotype")}
            />
            <input
              type="text"
              placeholder={t(locale, "TypeChatToSearch")}
              value={inputChatSearch}
              onChange={(event) => setInputChatSearch(event.target.value)}
              className="w-full rounded-[0.3rem] border border-gray-600 py-[0.45rem] pl-8 pr-4 text-[0.8rem] text-blue-900 placeholder-gray-600 outline-none focus:border-blue-900 dark:border-black-800 dark:bg-black-600 dark:text-white"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setChatSearch(true);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterChats;
