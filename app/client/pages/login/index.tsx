/* Imports */
import React, { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import t from "@/lang/locale";

import { signIn } from "next-auth/react";
import isWebview from 'is-ua-webview';


import {
  BACKGROUND_LOGIN,
  ETENDO_SQUARE_LOGOTYPE,
  STARS,
  WHITE_CLOSE,
  SHOW_PASSWORD,
  HIDE_PASSWORD,
} from "@/src/utils/constants";

// function getServerSideProps using the withSessionSsr higher-order function for checks if the user is authenticated
// export const getServerSideProps = withSessionSsr(
//   async function getServerSideProps(context) {
//     if (context.req.session?.isAuthenticated) {
//       return authenticatedUser();
//     } else {
//       return { props: {} };
//     }
//   }
// );

const Login = () => {
  const handleSignIn = () => {
    if (isWebview(window.navigator.userAgent)) {
      alert("Esta aplicación soporta navegadores seguros como Chrome, Firefox o Safari. Por favor, inicia sesión utilizando alguno de estos navegadores.");
      return;
    }
    signIn("google");
  };

  // page context using Next.js
  const router = useRouter();
  const { locale } = router;

  // page states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showInvalidCredentialsMessage, setShowInvalidCredentialsMessage] =
    useState(false);

  // function to hide or view the password
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      // background image for the login screen is set here
      className="flex h-screen w-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${BACKGROUND_LOGIN})` }}
    >
      {/* show the invalid credentials message if necessary */}
      {showInvalidCredentialsMessage && (
        <div className="absolute bottom-20 right-0 flex items-center gap-3 bg-red-500 py-3 px-5 font-medium text-white">
          <img
            className="mx-auto h-3 cursor-pointer"
            src={WHITE_CLOSE}
            alt={t(locale, "InvalidCredentials")}
            onClick={() => setShowInvalidCredentialsMessage(false)}
          />
          <p>{t(locale, "InvalidCredentialsTryAgain")}</p>
        </div>
      )}

      <div className="w-full max-w-[34rem] rounded-[20px] bg-white px-14 pt-[4.25rem] pb-[4.25rem] shadow-sm">
        <div className="mb-6 text-center">
          {/* show the Etendo logotype */}
          <img
            className="mx-auto h-[5rem]"
            src={ETENDO_SQUARE_LOGOTYPE}
            alt={t(locale, "EtendoLogotype")}
          />
          {/* show the "Welcome" text with stars */}
          <div className="flex items-end justify-center">
            <h1 className="mt-4 text-3xl font-medium text-blue-900">
              {t(locale, "Welcome")}
            </h1>
            <img className="h-8" src={STARS} alt={t(locale, "Stars")} />
          </div>
          {/* show the login screen message */}
          <p className="mt-[0.4rem] text-[1.1rem] text-gray-700">
            {t(locale, "Enter your credentials to access your account.")}
          </p>
        </div>

        <button
          // when the button is clicked, call the handleLogin function
          onClick={handleSignIn}
          className="mt-7 flex w-full items-center justify-center rounded-lg bg-blue-900 py-[0.825rem] text-[1.05rem] font-medium text-white"
        >
          {/* show the "Login" text */}
          Iniciar Sesión con Google
        </button>

        <button
          // when the button is clicked, call the handleLogin function
          onClick={handleSignIn}
          className="mt-7 flex w-full items-center justify-center rounded-lg bg-blue-900 py-[0.825rem] text-[1.05rem] font-medium text-white"
        >
          {/* show the "Login" text */}
          Registrarse
        </button>
      </div>
    </div>
  );
};

export default Login;
