/* Imports */
import React, { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import t from "@/lang/locale";

import { authenticatedUser } from "@/src/utils/functions";
import { withSessionSsr } from "@/src/utils/withSession";

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

  // the handleLogin function is an asynchronous function that handles the login process
  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    // prevent the default form submission behavior
    event.preventDefault();

    // send a fetch request to the /api/login API route with the user's credentials
    const request = await fetch("/api/login", {
      method: "POST", // use the POST method for the request
      headers: { contentType: "application/json" }, // set the content type of the request to JSON
      body: JSON.stringify({
        // convert the username and password variables to a JSON string
        username: username,
        password: password,
      }),
    });

    // if the fetch request is successful (HTTP status code 200), navigate to the home page
    // if (request.ok) {
      await router.push("/chat");
    // } else {
    //   setInvalidCredentials(true);
    //   setShowInvalidCredentialsMessage(true);
    // }
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

        <form onSubmit={handleLogin}>
          <div className="mb-5">
            {/* show the username input */}
            <label
              className="font-regular mb-1 block text-gray-600"
              htmlFor="username"
              id="username"
            >
              {t(locale, "Username")}
            </label>
            <input
              className={`w-full appearance-none rounded-md border-[1.5px] ${
                invalidCredentials ? "border-red-600" : "border-gray-600"
              } py-2 px-3 leading-tight text-blue-900 focus:border-blue-900 focus:shadow-sm focus:outline-none`}
              id="username"
              type="text"
              placeholder={t(locale, "EnterUsername")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setInvalidCredentials(false)}
              autoComplete="username"
            />
          </div>
          <div className="relative mb-5">
            {/* show the password input */}
            <label
              className="font-regular mb-1 block text-gray-600"
              htmlFor="password"
              id="password"
            >
              {t(locale, "Password")}
            </label>
            <input
              className={`w-full appearance-none rounded-md border-[1.5px] ${
                invalidCredentials ? "border-red-600" : "border-gray-600"
              } py-2 px-3 leading-tight text-blue-900 focus:border-blue-900 focus:shadow-sm focus:outline-none`}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t(locale, "EnterPassword")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setInvalidCredentials(false)}
              autoComplete="current-password"
            />
            <img
              className="absolute right-5 top-[72.25%] h-6 -translate-y-1/2 cursor-pointer"
              src={showPassword ? SHOW_PASSWORD : HIDE_PASSWORD}
              alt={t(locale, "Remember")}
              onClick={toggleShowPassword}
            />
          </div>

          <button
            // when the button is clicked, call the handleLogin function
            onClick={() => handleLogin}
            className="mt-7 flex w-full items-center justify-center rounded-lg bg-blue-900 py-[0.825rem] text-[1.05rem] font-medium text-white"
          >
            {/* show the "Login" text */}
            {t(locale, "Login")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
