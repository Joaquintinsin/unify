/* Imports */
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import t from "@/lang/locale";

import {
  getAuthorizationCode,
  getGreeting,
  handleSwitchMode,
} from "@/src/utils/functions";

import {
  DARK_THEME,
  DEFAULT_USER,
  DOTS,
  UNIFY_LOGOTYPE,
  ETENDO_WHITE_LOGOTYPE,
  LIGHT_THEME,
  SETTINGS,
  SETTINGS_DARK,
} from "@/src/utils/constants";

import { ThemeModeContext } from "@/src/context/ThemeModeContext";
import { IsGuestProps } from "@/src/utils/interfaces";

// UserNavbar component
const UserNavbar = () => {
  const { locale } = useRouter();

  const { darkMode, setDarkMode } = useContext(ThemeModeContext);
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [code, setCode] = useState<any>("");

  // Create references
  const popupRef = React.useRef<any>(null);
  const buttonRef = React.useRef<any>(null);

  // Handle theme mode switch
  handleSwitchMode(setDarkMode);
  const [showUserPopup, setShowUserPopup] = useState(false);

  // Function to handle popup visibility
  const handlePopup = () => {
    setShowUserPopup(!showUserPopup);
  };

  // Function to handle click outside of popup
  const handleClickOutside = (event: any) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(event.target) &&
      !buttonRef.current.contains(event.target)
    ) {
      setShowUserPopup(false);
    }
  };

  useEffect(() => {
    // Fetch user info on component mount
    getUserinfo();

    // Get authorization code and checks if the current URL is the logout URL. If it is, it redirects the user to the login page
    setCode(getAuthorizationCode());

    // Add event listener for click outside of popup
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Define request options for fetching user info
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: code,
    }),
  };

  // Fetch user info after a delay
  useEffect(() => {
    setTimeout(() => {
      getUserinfo();
    }, 2500);
  }, [code]);

  // Function to fetch user info
  const getUserinfo = async () => {
    fetch("/api/userinfo", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        const userinfo = JSON.parse(data);
        if (userinfo) {
          setName(userinfo.name);
          setUsername(userinfo.preferred_username);
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };



  // update password
  const handleUpdatePassword = () => {
    fetch("/api/updatePassword")
      .then((response) => response.json())
      .then((data) => {
        window.location.href = data.url;
      });
  };

  // logout
  const handleLogout = async () => {
    const response = await fetch("/api/logout", { method: "POST" });
    if (response.ok) {
      const data = await response.json();
      window.location.href = data.logoutUrl;
    } else {
      console.error("Error to logout");
    }
  };

  // this component returns the user navbar
  return (
    // this is a navbar with a logo and components on the left and right side
    <nav className="flex items-center justify-between border-b border-gray-400 bg-white px-8 py-2">
      {/* logo in the left */}
      <div>
        {!darkMode && <Image
          height={80}
          width={80}
          src={UNIFY_LOGOTYPE}
          alt={t(locale, "EtendoLogotype")}
        />}
      </div>

      {/* components in the right */}
      <div className="flex items-center gap-5">
        {/* container with the user's name and picture */}
        <div className="relative flex items-center gap-2">
          <p className="text-[0.9rem] text-gray-600">
            {getGreeting(t, locale)}
          </p>
          {/* wrap the div containing the user's image and the popup */}
          <div className="relative">
            <Image
              height={33}
              width={33}
              src={DEFAULT_USER}
              alt={t(locale, "UserPicture")}
            />
          </div>
        </div>

        {/* an options icon */}
        <div className="relative">
          <div
            onClick={handlePopup}
            className={`icon-container cursor-pointer`}
            ref={buttonRef}
          >
            <Image
              height={16}
              width={16}
              src={DOTS}
              alt={t(locale, "Options")}
            />
          </div>
          {showUserPopup && (
            <div
              ref={popupRef}
              className="absolute right-0 isolate z-10 flex w-56 flex-col rounded-md bg-white pt-2 shadow-md dark:border-black-800 dark:bg-black-700"
            >
              <div className="flex border-b border-b-gray-300 py-3 px-4 dark:border-b-black-800">
                <div className="flex items-center gap-3">
                  <Image
                    height={36}
                    width={36}
                    src={DEFAULT_USER}
                    alt={t(locale, "UserPicture")}
                  />

                  <div className="flex flex-col text-ellipsis">
                    <h5 className="ellipsis text-[0.85rem] font-medium text-blue-900 dark:text-white">
                      {name || "admin"}
                    </h5>
                    <p className="w-full text-[0.75rem] text-gray-600">
                      {username || "admin@gmail.com"}
                    </p>
                  </div>
                </div>
              </div>

              <h4
                onClick={handleLogout}
                className="m-2 flex cursor-pointer items-center gap-[0.9rem] rounded-lg p-2 text-[0.875rem] font-medium text-blue-900 transition duration-700 hover:bg-blue-200 dark:border-black-800 dark:text-black-300 dark:hover:bg-black-800"
              >
                {t(locale, "Logout")}
              </h4>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
