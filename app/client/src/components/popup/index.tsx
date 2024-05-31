import t from "@/lang/locale";
import { ShowPopupContext } from "@/src/context/ShowPopupContext";
import {
  BACKGROUND_POPUP,
  BACKGROUND_POPUP_DARK,
  NETWORK_RESPONSE_NOT_OK,
  SAD_RED,
  SMILE_GREEN,
  WHITE_CHECK,
} from "@/src/utils/constants";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";

const Popup = () => {
  const {
    showLikePopup,
    showDislikePopup,
    setShowLikePopup,
    setShowDislikePopup,
    messageId,
    rating,
  } = useContext(ShowPopupContext);
  const { locale } = useRouter();

  if (!showLikePopup && !showDislikePopup) return null;

  const [userComment, setUserComment] = useState<string>("");
  const [commentSent, setCommentSent] = useState(false);

  const handleClick = (event: any) => {
    if (
      event.target.className ===
      "absolute z-10 flex h-screen w-screen items-center justify-center bg-[rgb(0,0,0,0.25)]"
    ) {
      setShowLikePopup(false);
      setShowDislikePopup(false);
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleClick);
    setCommentSent(false);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  const handleUserComment = async () => {
    try {
      const response: any = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          messageId: messageId,
          rating: rating,
          comments: userComment,
        }),
      });

      if (!response.ok) {
        throw new Error(NETWORK_RESPONSE_NOT_OK);
      }
      setCommentSent(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const darkMode = localStorage.getItem("darkMode") === "true";

  return (
    <div
      className="absolute z-30 flex h-screen w-screen items-center justify-center bg-[rgb(0,0,0,0.25)]"
      onClick={() => {
        setShowLikePopup(false);
        setShowDislikePopup(false);
      }}
    >
      <div
        className="h-[23.5rem] w-[32.5rem] rounded-2xl bg-white dark:bg-black-500"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-full w-full">
          <img
            src={darkMode ? BACKGROUND_POPUP_DARK : BACKGROUND_POPUP}
            alt={t(locale, "Background popup")}
            className="w-full rounded-lg"
          />
          <div className="absolute inset-9 flex justify-center">
            <div>
              <div className="rounded-3xl bg-white p-5 dark:bg-black-600">
                <img
                  src={showLikePopup ? SMILE_GREEN : SAD_RED}
                  alt={t(locale, "Correct answer")}
                  className="h-12 w-full"
                />
              </div>
            </div>
          </div>
          <div className="absolute inset-40 top-[9rem] left-0 flex w-full flex-col items-center">
            <div className="w-[87.5%] text-xl font-medium text-blue-900 dark:text-white">
              <p>
                {showLikePopup
                  ? t(locale, "ThankYou")
                  : t(locale, "HelpImprove")}
              </p>
              <div className="mt-2 flex">
                <textarea
                  onChange={(event) => setUserComment(event.target.value)}
                  placeholder={
                    showLikePopup
                      ? t(locale, "WriteAnswerGood")
                      : t(locale, "BestAnswer")
                  }
                  className="flex h-[6.5rem] w-full resize-none rounded-md border border-solid border-blue-900 px-4 py-3 text-[0.95rem] font-normal leading-5 placeholder-gray-600 focus:border-blue-900 focus:outline-none dark:border-black-800 dark:bg-black-600 dark:placeholder-gray-800"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleUserComment}
                  className="mt-4 flex items-center justify-center rounded bg-blue-900 px-4 py-2 text-sm font-normal text-white dark:bg-black-800 dark:text-gray-400"
                >
                  <div className="flex items-center">
                    {commentSent && (
                      <img
                        src={WHITE_CHECK}
                        alt={t(locale, "SuccessfullySent")}
                        className="mr-[0.55rem] h-[0.8rem]"
                      />
                    )}
                    <p className="text-[0.85rem]">
                      {commentSent
                        ? t(locale, "SuccessfullySent")
                        : t(locale, "PostComments")}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
