import React from "react";
import SectionChat from "./section-chat";

const Chat = () => {
  return (
    // main container of the chat component
    <div className="section-chat-container relative h-full w-full bg-gray-500">
      {/* component that contains the chats */}
      <SectionChat />
    </div>
  );
};

export default Chat;
