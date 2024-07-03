import { AuthenticationProvider } from "@/shared/enums/authenticationProvider";
import { Constants } from "./constants";
import { Session } from "next-auth";
import { supportedLocales } from "./locales";

export const reTrue = /true|1|yes/i;
const reSigninUrl = /\/signin\/?$/i;
const reNumber = /\d+/;

type Valuable<T> = {
  [K in keyof T as T[K] extends null | undefined ? never : K]: T[K];
};

export default class Utils {
  static addMutationObserver = (
    onChange: () => void,
    type: string = "attributes",
    name: string = "data-theme"
  ) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          onChange();
        }
      });
    });

    if (type === "attributes" && name === "data-theme") {
      observer.observe(document.getElementsByTagName("html")[0], {
        attributes: true,
      });
    }

    return observer;
  };

  static addMutationObserverForSearchText = (
    onChange: () => void,
    type: string = "attributes",
    name: string = "value"
  ) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "value"
        ) {
          onChange();
        }
      });
    });

    if (type === "attributes" && name === "value") {
      const searchText = document.getElementById("searchText");
      if (searchText) {
        observer.observe(searchText, {
          attributes: true,
        });
      }
    }

    return observer;
  };

  static capitalizeAllWords(input: string, wordSeparator: string = " ") {
    if (!input) return input;

    return (
      input
        .split(wordSeparator)
        .map((word) => {
          return word[0].toUpperCase() + word.substring(1);
        })
        .join(wordSeparator) ?? input
    );
  }

  static decapitalizeFirstWord(
    input: string,
    wordSeparator: string = "_x0020_"
  ) {
    if (!input) return input;

    return `${input[0].toLowerCase()}${input
      .substring(1)
      .replace(new RegExp(wordSeparator, "gi"), "")}`;
  }

  static isGoogle = (emailOrProviderName: string | null | undefined) => {
    return /@gmail\.com|google/i.test(emailOrProviderName || "");
  };

  static generatePassword = (
    passwordLength = 18,
    enforceLowerCase: boolean = true,
    enforceUpperCase: boolean = true,
    enforceNumbers: boolean = true,
    enforceExtraChars: boolean = true
  ) => {
    let chars = "";
    if (enforceLowerCase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (enforceUpperCase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (enforceNumbers) chars += "0123456789";
    if (enforceExtraChars) chars += "!@#$%^&*()";

    let password = "";
    for (let i = 0; i < passwordLength; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  static getAuthenticationProvider = (
    session?: Session | null
  ): AuthenticationProvider | undefined => {
    if (!session?.user?.email) {
      return undefined;
    } else if (this.isGoogle(session?.user?.email)) {
      return AuthenticationProvider.google;
    } else {
      return AuthenticationProvider.microsoftEntraId;
    }
  };

  static getScrollbarWidth = () =>
    window.innerWidth - document.documentElement.clientWidth;

  static getStringSetting = (key: string): string => {
    return process.env[key] || "";
  };

  static getStringArraySetting = (key: string): string[] | undefined => {
    return process.env[key]?.split(",").map((attr) => attr.trim());
  };

  static getBoolSetting = (key: string): boolean => {
    return reTrue.test(this.getStringSetting(key));
  };

  static getValuable = <T extends {}, V = Valuable<T>>(obj: T): V => {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([, v]) =>
          !(
            (typeof v === "string" && !v.length) ||
            v === null ||
            typeof v === "undefined"
          )
      )
    ) as V;
  };

  static isDarkMode = (defaultTheme: string = Constants.defaultTheme) => {
    if (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    ) {
      const theme = window.localStorage.getItem("theme");
      return !theme ? defaultTheme : theme === "dark";
    }
  };

  static isLocaleUrl = (url: string) =>
    Object.values(supportedLocales).some((locUrl) => url.startsWith(locUrl));

  static isSigninUrl = (url: string) => reSigninUrl.test(url);

  static getLocaleUrl = (url: string) => {
    if (this.isLocaleUrl(url)) {
      for (let locUrl of Object.values(supportedLocales)) {
        if (url.startsWith(locUrl)) {
          return locUrl;
        }
      }
    }
    return "";
  };

  static stripLocaleUrl = (url: string) => {
    if (this.isLocaleUrl(url)) {
      for (let locUrl of Object.values(supportedLocales)) {
        if (url.startsWith(locUrl)) {
          return url.substring(locUrl.length);
        }
      }
    }
    return url;
  };

  static stripTrailSlash = (url: string) => url.replace(/\/$/, "");

  static stripSigninUrl = (url: string) =>
    this.isSigninUrl(url) ? url.replace(reSigninUrl, "") : url;

  static propertiesToArray(obj: any): string[] {
    const isObject = (val: any) =>
      val && typeof val === "object" && !Array.isArray(val);

    const addDelimiter = (a: string | null, b: string) =>
      a && !reNumber.test(a) ? `${a}.${b}` : b;

    const paths = (obj: any = {}, head: string = ""): string[] => {
      return Object.entries(obj).reduce(
        (accumulator: string[], [key, value]) => {
          let fullPath = addDelimiter(head, key);
          return isObject(value)
            ? accumulator.concat(paths(value, fullPath))
            : accumulator.concat(fullPath);
        },
        []
      );
    };

    const results = paths(obj);
    return Array.from(new Set(results)).sort();
  }
}
