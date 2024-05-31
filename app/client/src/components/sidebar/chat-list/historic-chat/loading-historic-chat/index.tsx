import React from "react";

const LoadingHistoricChat = () => {
  return (
    <div className="border-b border-b-gray-300 py-[1.45rem] px-8 dark:border-b-black-600 dark:bg-black-500">
      <div className="mb-[0.4rem] flex w-full items-center justify-between">
        <div className="h-[1.025rem] w-[70%] animate-pulse rounded bg-gray-300 dark:bg-black-600"></div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-pulse rounded bg-gray-300 dark:bg-black-600"></div>
          <div className="h-4 w-4 animate-pulse rounded bg-gray-300 dark:bg-black-600"></div>
          <div className="h-4 w-4 animate-pulse rounded bg-gray-300 dark:bg-black-600"></div>
        </div>
      </div>
      <div className="flex w-full items-center justify-between">
        <div className="h-[0.825rem] w-[4rem] animate-pulse rounded bg-gray-300 dark:bg-black-600"></div>
      </div>
    </div>
  );
};

export default LoadingHistoricChat;
