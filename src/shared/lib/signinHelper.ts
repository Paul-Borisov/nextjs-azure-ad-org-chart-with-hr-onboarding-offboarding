"use client";

import { AuthenticationProvider } from "@/shared/enums/authenticationProvider";
import Utils from "./utils";

export class SigninHelper {
  // components/client/LoginButton.tsx
  static getSigninUrlWithCallbackUrl = () => {
    const localePath = "/" + document.querySelector("html")?.lang ?? "";

    return `${localePath !== "/" ? localePath : ""}/signin/${
      AuthenticationProvider.default
    }?callbackUrl=${encodeURIComponent(
      window.location.origin +
        (window.location.pathname !== "/"
          ? Utils.stripSigninUrl(window.location.pathname)
          : "")
    )}`;
  };

  // The intercepting route (.)signin/[provider]/page.tsx > components/client/Modal.tsx > components/client/ModalSignin.tsx
  static getSigninUrlWithCallbackUrlForProvider = (
    provider: AuthenticationProvider
  ) => {
    const path = window.location.pathname;
    const search = window.location.search + window.location.hash;

    return (window.location.href = `${path?.replace(
      AuthenticationProvider.default,
      ""
    )}/${provider}/${search}`);
  };

  // The actual (intercepted) route signin/[provider]/page.tsx > components/client/ModalSigninRedirect.tsx
  static getCallbackUrl = () => {
    let callbackUrl = decodeURIComponent(
      window.location.search.replace(`?${"callbackUrl"}=`, "")
    );
    if (callbackUrl) {
      callbackUrl = /^(http|\/)/i.test(callbackUrl) ? callbackUrl : "/";
    }

    return callbackUrl;
  };
}
