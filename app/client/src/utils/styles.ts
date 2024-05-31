export function chatbotMessageStyles(
  darkMode: boolean,
  error: boolean | undefined
) {
  let classNames = "slide-in text-black my-3 rounded-lg py-3 text-[0.95rem]";

  if (error) {
    classNames +=
      " border border-red-500 bg-red-200 font-medium text-gray-700 shadow-md dark:border-red-500";
  } else {
    classNames += " box-shadow bg-white";
  }

  if (darkMode) {
    classNames += " dark:bg-black-600 dark:text-white";
  }

  return classNames;
}
