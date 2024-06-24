import i18n from "i18next";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "de", name: "German" },
  { code: "cn", name: "Chinese" },
];

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    lng: "en",
    fallbackLng: "en",
    supportedLngs: LANGUAGES.map((lang) => lang.code),
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
