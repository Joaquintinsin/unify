export interface Chat {
  conversationId: string;
  creationDate: string;
  externalUserID: string;
  favourite: boolean;
  title: string;
  visible: boolean;
}

export interface IsGuestProps {
  isGuest: boolean;
}

export interface SessionChat {
  conversationId: string;
  creationDate: string;
  externalUserID: string;
  favourite: boolean;
  title: string;
  visible: boolean;
}
