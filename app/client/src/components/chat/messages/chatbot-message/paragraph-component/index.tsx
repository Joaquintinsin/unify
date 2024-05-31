import { ShowPopupContext } from "@/src/context/ShowPopupContext";
import {
  RATING_CORRECT_ANSWER,
  RATING_WRONG_ANSWER,
  SAD,
  SAD_RED,
  SMILE,
  SMILE_GREEN,
} from "@/src/utils/constants";
import React, { useContext, useState } from "react";

export const ParagraphComponent = ({
  node,
  className,
  children,
  messageId,
  error,
  ...props
}: any) => {
  const { setShowLikePopup, setShowDislikePopup, setRating, setMessageId } =
    useContext(ShowPopupContext);

  const [isHoverSmile, setIsHoverSmile] = useState(false);
  const [isHoverSad, setIsHoverSad] = useState(false);

  const handleLikeClick = () => {
    setShowLikePopup(true);
    setShowDislikePopup(false);
    setMessageId(messageId);
    setRating(RATING_CORRECT_ANSWER);
  };

  const handleDislikePopup = () => {
    setShowLikePopup(false);
    setShowDislikePopup(true);
    setMessageId(messageId);
    setRating(RATING_WRONG_ANSWER);
  };

  const renderHighlightedText = (text: string) => {
    const regex = /@([^@]+)@/g;
    const newText = text.replace(
      regex,
      "<span class='highlightedText'>$1</span>"
    );
    return newText;
  };

  /**
   * Splits the provided text into main and secondary parts for distinct rendering.
   * The main part is the primary content of the message and the secondary part, identified by being after "?? ", is used for rendering
   * feedback elements like "Was this answer helpful?"
   */
  const renderSplitText = (text: string) => {
    const splitText = text.split("?? ");
    return {
      mainText: renderHighlightedText(splitText[0]),
      secondaryText: splitText.length > 1 ? splitText[1] : "",
    };
  };

  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      const { mainText, secondaryText } = renderSplitText(child);
      return (
        <div>
          <p
            className="px-5"
            {...props}
            dangerouslySetInnerHTML={{ __html: mainText }}
          />
          {/* render a div element that contains the smiley face and sad face icons, as well as the "Was this answer helpful?" text. */}
          {!error && secondaryText && (
            <div className="mt-3 flex items-center gap-3 border-t border-l-[-2rem] border-gray-500 px-5 pt-2 dark:border-black-800">
              <p className="cursor-text text-sm text-gray-600 hover:text-blue-900 dark:hover:text-gray-800">
                {secondaryText}
              </p>
              <div className="flex items-center gap-2">
                <div
                  onMouseEnter={() => setIsHoverSmile(true)}
                  onMouseLeave={() => setIsHoverSmile(false)}
                  className="cursor-pointer rounded border border-gray-300 p-1 hover:bg-gray-100 dark:border-black-800 dark:hover:bg-black-700"
                  onClick={handleLikeClick}
                >
                  <img
                    className="h-4"
                    src={isHoverSmile ? SMILE_GREEN : SMILE}
                    alt="Like"
                  />
                </div>

                <div
                  onMouseEnter={() => setIsHoverSad(true)}
                  onMouseLeave={() => setIsHoverSad(false)}
                  className="cursor-pointer rounded border border-gray-300 p-1 hover:bg-gray-100 dark:border-black-800 dark:hover:bg-black-700"
                  onClick={handleDislikePopup}
                >
                  <img
                    className="h-4 cursor-pointer"
                    src={isHoverSad ? SAD_RED : SAD}
                    alt="Unlike"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="px-5" {...props}>
          {child}
        </div>
      );
    }
  });
};
