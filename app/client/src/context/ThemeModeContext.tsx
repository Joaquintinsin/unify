import { createContext, useState } from "react";

interface IContextProps {
  darkMode: boolean;
  setDarkMode: ({ type }: any) => void;
}

export const ThemeModeContext = createContext({} as IContextProps);

export const ThemeModeProvider = ({ children }: any) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  return (
    <ThemeModeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
};
