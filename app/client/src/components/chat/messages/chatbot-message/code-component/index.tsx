import { COPY_WHITE } from "@/src/utils/constants";
import React, { useState } from "react";
import { nightOwl } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import SyntaxHighlighter from "react-syntax-highlighter";
import t from "@/lang/locale";
import { useRouter } from "next/router";

export const CodeComponent = ({
  node,
  inline,
  className,
  children,
  ...props
}: any) => {
  const { locale } = useRouter();
  const [copiedCode, setCopiedCode] = useState(false);

  // function to copy the code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
  };

  if (!inline) {
    return (
      <div className="my-3 w-full rounded px-5">
        <div className="font-regular flex items-center justify-end rounded-t-[0.5rem] bg-[#343444] px-5 pt-[0.4rem] pb-[0.4rem] text-[0.75rem] text-white">
          <div
            className="flex cursor-pointer items-center gap-2"
            onClick={() => handleCopyCode(children)}
          >
            <img
              className="h-[0.8rem]"
              src={COPY_WHITE}
              alt={t(locale, "CopyText")}
            />
            <p>
              {copiedCode ? t(locale, "TextCopied") : t(locale, "CopyCode")}
            </p>
          </div>
        </div>
        <SyntaxHighlighter
          children={String(children).replace(/\n$/, "")}
          style={nightOwl}
          language="java"
          PreTag="div"
          wrapLongLines={true}
          customStyle={{
            borderBottomRightRadius: "0.5rem",
            borderBottomLeftRadius: "0.5rem",
            fontSize: "0.95rem",
          }}
          {...props}
        />
      </div>
    );
  } else {
    return (
      <p className="py rounded bg-gray-300 px-1 font-medium dark:bg-blue-800 dark:text-white">
        {children}
      </p>
    );
  }
};
