import { Html, Head, Main, NextScript } from "next/document";
import { NextAuthProvider } from "./Providers";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <NextAuthProvider>
          <Main />
          <NextScript />
        </NextAuthProvider>
      </body>
    </Html>
  );
}
