import { Config } from "next-i18n-router/dist/types";

export const i18nConfig: Config = {
  //https://github.com/i18nexus/next-i18n-router
  locales: ["en", "no", "fi"],
  defaultLocale: "en",
  serverSetCookie: "never",
  //prefixDefault: true,
};

export default i18nConfig;
