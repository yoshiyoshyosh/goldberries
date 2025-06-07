import i18n from "i18next";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { IS_DEBUG } from "../util/constants";

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "de", name: "German" },
  { code: "cn", name: "Chinese" },
  { code: "fr", name: "French" },
  { code: "ru", name: "Russian" },
];

const DETECTION_OPTIONS = {
  order: ["localStorage", "navigator"],
  caches: ["localStorage"],
};

i18n
  .use(LanguageDetector)
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    // lng: "en",
    fallbackLng: "en",
    detection: DETECTION_OPTIONS,
    supportedLngs: LANGUAGES.map((lang) => lang.code),
    debug: IS_DEBUG,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
