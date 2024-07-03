"use client";
import { AuthenticationProvider } from "@/shared/enums/authenticationProvider";
import { signIn, useSession } from "next-auth/react";
import Svg, { SvgType } from "@/shared/images/Svg";
import UrlUtils from "@/shared/lib/urlUtils";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";

const ModalSignnRedirect = () => {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const params = useParams<{ provider: string }>();

  let callbackUrl = UrlUtils.getCallbackUrlFromQueryString();

  useEffect(() => {
    if (session) {
      window.location.href = callbackUrl;
    } else if (!(status === "loading")) {
      signIn(
        !params?.provider || params.provider === AuthenticationProvider.default
          ? AuthenticationProvider.microsoftEntraId
          : params.provider,
        { callbackUrl: callbackUrl }
      );
    }
  }, [callbackUrl, params?.provider, session, status]);

  return (
    <div className="absolute h-screen w-screen left-[45vw] top-5 z-10 tablet:left-4 tablet:top-16">
      <div role="status" className="flex gap-2">
        {Svg[SvgType.loading]}
        <span>{t("loading")}...</span>
      </div>
    </div>
  );
};

export default ModalSignnRedirect;
