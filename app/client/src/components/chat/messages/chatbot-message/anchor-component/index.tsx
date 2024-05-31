import React from "react";

export const AnchorComponent = ({ node, children, href, ...props }: any) => (
  <div>
    📖 &nbsp;
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium underline"
      {...props}
    >
      {children}
    </a>
  </div>
);
