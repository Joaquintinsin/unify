import { NextRouter } from "next/router";
import { useEffect } from "react";
import { Chat } from "./interfaces";
import { POST } from "./constants";

export const authenticatedUser = () => {
  return {
    redirect: {
      permanent: true,
      destination: "/chat",
    },
  };
};

// Create a function to generate the authentication URL
export const createAuthUrl = (): string => {
  const keycloakUrl = process.env.AUTH_ENDPOINT;
  const clientId = "bastian-experimental";
  const redirectUri = encodeURIComponent(
    `${process.env.BASTIAN_PUBLIC_URL}/chat`
  );
  const state = process.env.KEYCLOACK_STATE;
  const responseMode = "fragment";
  const responseType = "code";
  const scope = "openid";
  const nonce = process.env.KEYCLOACK_NONCE;
  const codeChallenge = process.env.CODE_CHALLENGE;
  const codeChallengeMethod = "S256";

  return `${keycloakUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&response_mode=${responseMode}&response_type=${responseType}&scope=${scope}&nonce=${nonce}&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}`;
};

export const unauthenticatedUser = async () => {
  const destination = createAuthUrl();

  return {
    redirect: {
      permanent: false,
      destination,
    },
  };
};

// Create a function to refresh the auth token
export const refreshToken = async () => {
  const response = await fetch(
    `${process.env.BASTIAN_PUBLIC_URL}/api/refresh-token`,
    {
      method: POST,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  await response.json();

  const destination = createAuthUrl();

  return {
    redirect: {
      permanent: false,
      destination,
    },
  };
};

export const getAuthorizationCode = () => {
  let url = window.location.href;
  let inicioCode = url.indexOf("code=") + 5;
  if (inicioCode === 4) {
    return null;
  }

  let finCode = url.indexOf("&", inicioCode);
  if (finCode === -1) {
    finCode = url.length;
  }

  let code = url.substring(inicioCode, finCode);
  return code;
};

export const getBrowserLanguage = (router: NextRouter) => {
  const browserLanguage = navigator.language.split("-")[0];
  if (["es"].includes(browserLanguage)) {
    router.replace(`/${browserLanguage}/chat`);
  } else {
    router.replace("/en/chat");
  }
};

export function handleSwitchMode(setDarkMode: ({ type }: any) => void) {
  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode") === "true";

    if (darkMode) {
      window.document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      window.document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, [setDarkMode]);
}

export const getGreeting = (t: any, locale: string | undefined) => {
  const currentHour = new Date().getHours();
  if (currentHour >= 6 && currentHour < 12) {
    return t(locale, "GoodMorning");
  } else if (currentHour >= 12 && currentHour < 18) {
    return t(locale, "GoodAfternoon");
  } else {
    return t(locale, "GoodEvening");
  }
};

// It first sorts by the 'favourite' property (putting favourite chats first), and then sorts by date
export const orderChats = (chats: Chat[]): Chat[] => {
  return chats.sort((firstChat: Chat, secondChat: Chat) => {
    // convert the boolean 'favourite' values to numbers (true becomes 1, false becomes 0)
    // subtracting these gives -1 if the first chat is favourited and the second is not,
    // 1 if the second chat is favourited and the first is not,
    // and 0 if both chats have the same favourited status.
    const favouriteComparison =
      Number(secondChat.favourite) - Number(firstChat.favourite);

    // if the chats do not have the same favourited status, return the result of the subtraction.
    if (favouriteComparison !== 0) return favouriteComparison;

    // if both chats have the same favourited status (i.e., the subtraction result was 0),
    // then order them by date.
    const firstDate = new Date(firstChat.creationDate);
    const secondDate = new Date(secondChat.creationDate);

    return secondDate.getTime() - firstDate.getTime();
  });
};

export function convertDate(dateISO: string): string {
  const date = new Date(dateISO);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    const options: any = { hour: "numeric", minute: "numeric", hour12: true };
    return date.toLocaleTimeString("en-US", options);
  } else {
    const options: any = { day: "numeric", month: "short" };
    return date.toLocaleDateString("en-US", options);
  }
}

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getChatTitle = (chat: string) => {
  const title = chat;

  if (!title) {
    return "";
  }

  if (title.length > 10) {
    return capitalize(title.substring(0, 25) + "...");
  } else {
    return capitalize(title);
  }
};

export function cleanMessage(message: string): string {
  const backticksRegex = /(?<!`)`(?!`)([^`]+)(?<!`)`(?!`)/g;
  const urlRegex = /(http(s)?:\/\/[^ ,]*)\s*[,|\.]?\s*(and)?/gi;

  const cleanedMessage = message
    .replace(backticksRegex, (match, word) => {
      return `@${word}@`;
    })
    .replace(urlRegex, "$1 ");

  return cleanedMessage;
}

export function acceptableInput(input: string): boolean {
  const trimmedInput = input.trim();

  return trimmedInput.length > 10;
}
