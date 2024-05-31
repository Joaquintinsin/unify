import { createContext, useState } from "react";

interface IContextProps {
  deletedChats: boolean;
  setDeletedChats: ({ type }: any) => void;
}

export const DeletedChatsContext = createContext({} as IContextProps);

export const DeletedChatsProvider = ({ children }: any) => {
  const [deletedChats, setDeletedChats] = useState<boolean>(false);

  return (
    <DeletedChatsContext.Provider value={{ deletedChats, setDeletedChats }}>
      {children}
    </DeletedChatsContext.Provider>
  );
};
