import Head from "next/head";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { UNIFY_FAVICON } from "@/src/utils/constants";
import "./index.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Unify</title>
        <meta name="description" content={'Unify'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={UNIFY_FAVICON} />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
