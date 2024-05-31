import { createContext, useState } from "react";

interface IContextProps {
  code: string;
  setCode: ({ type }: any) => void;
}

export const CodeUrlContext = createContext({} as IContextProps);

export const CodeUrlProvider = ({ children }: any) => {
  const [code, setCode] = useState<string>("");

  return (
    <CodeUrlContext.Provider
      value={{
        code,
        setCode,
      }}
    >
      {children}
    </CodeUrlContext.Provider>
  );
};
