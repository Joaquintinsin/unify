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
  GOOGLE_ICON,
  UNIFY_LOGOTYPE,
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
      <div className="w-full max-w-[34rem] rounded-[20px] bg-white px-14 pt-[4.25rem] pb-[4.25rem] shadow-sm">
        <div className="mb-6 text-center">
          {/* show the Etendo logotype */}
          <img
            className="mx-auto h-32"
            src={UNIFY_LOGOTYPE}
            alt={"Unify Logotype"}
          />
          {/* show the "Welcome" text with stars */}
          <div className="flex items-end justify-center">
            <h1 className="mt-4 text-3xl font-medium text-blue-900">
              Welcome
            </h1>
            <img className="h-8" src={STARS} alt={t(locale, "Stars")} />
          </div>
          {/* show the login screen message */}
          <p className="mt-[0.4rem] text-[1.1rem] text-gray-700">
            Enter your credentials to access your account.
          </p>
        </div>

        <button
          onClick={handleSignIn}
          className="mt-7 border shadow-sm border-blue-900 flex w-full items-center justify-center rounded-lg bg-white py-[0.825rem] text-[18px] font-medium text-black-200 transition duration-300 ease-in-out transform hover:translate-y-[-2px] hover:shadow-lg"
        >
          <img
            src={GOOGLE_ICON}
            alt="Google Icon"
            className="mr-2 h-8 w-8"
          />
          Sign in with Google
        </button>
      </div>


    </div>
  );
};

export default Login;
