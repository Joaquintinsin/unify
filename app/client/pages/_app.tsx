import Head from "next/head";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { ETENDO_FAVICON } from "@/src/utils/constants";
import { useRouter } from "next/router";
import t from "@/lang/locale";
import "./index.css";


export default function App({ Component, pageProps }: AppProps) {
  const { locale } = useRouter();
  return (
    <>
      <Head>
        <title>Etendo Chatbot</title>
        <meta name="description" content={t(locale, "BastianGoal")} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={ETENDO_FAVICON} />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
