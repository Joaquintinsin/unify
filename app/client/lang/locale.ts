import { useRouter } from "next/router";
import en from "./en.json"; // English translations
import es from "./es.json"; // Spanish translations

const message: any = { en: en, es: es };

const t = (locale: any, key: any) => {
  if (!message[locale]) {
    const { defaultLocale } = useRouter();
    locale = defaultLocale; // Use default locale if provided locale is not available
  }
  if (!message[locale][key]) {
    return key; // Return the key itself if translation is not available
  }
  return message[locale][key]; // Return the translated message
};

export default t;
