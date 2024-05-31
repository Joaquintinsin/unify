export interface MessageProps {
  message: string;
  time: string;
  conversationId?: string;
  messageId?: string;
  error?: boolean;
}

export type ChildrenProps = {
  children: JSX.Element | JSX.Element[];
};
