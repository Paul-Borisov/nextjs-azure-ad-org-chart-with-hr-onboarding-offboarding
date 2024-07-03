"use client";
import { AuthenticationProvider } from "@/shared/enums/authenticationProvider";
import { Modal } from "./Modal";
import Flag from "@/shared/components/Flag";
import { SvgType } from "@/shared/images/Svg";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import Utils from "@/shared/lib/utils";
import { SigninHelper } from "@/shared/lib/signinHelper";

export default function ModalSignin() {
  const { t } = useTranslation();
  const isDarkMode = Utils.isDarkMode();

  return (
    <Modal>
      <div
        className={[
          "p-[7vw] rounded-2xl",
          isDarkMode ? "border-gray-800 border bg-[#191919]" : undefined,
        ]
          .join(" ")
          .trim()}
      >
        <div className="text-center">
          <div className="pb-5">{t("signinWith")}</div>
          <div className="flex flex-col">
            <ProviderButton
              text="Microsoft"
              provider={AuthenticationProvider.microsoftEntraId}
              icon={SvgType.microsoft}
            />
            <ProviderButton
              text="Google"
              provider={AuthenticationProvider.google}
              icon={SvgType.google}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

const ProviderButton = ({
  icon,
  provider,
  text,
}: {
  icon: string;
  provider: AuthenticationProvider;
  text: string;
}) => {
  const path = usePathname();
  return (
    <button
      className={
        "m-2 w-64 p-2 border-2 border-gray-600 rounded-md outline-none"
      }
      onClick={() => {
        // Current URL looks like http://localhost:3000/no/signin/default?callbackUrl=<page-url-where-login-button-was-clicked-from>
        // Take it, replace default provider with the selected one, and redirect to the new URL.
        // The handling logic is located in signin/[provider]/page.tsx
        window.location.href =
          SigninHelper.getSigninUrlWithCallbackUrlForProvider(provider);
        /*setTimeout(
          () =>
            (window.location.href = `${path?.replace(
              authenticationProvider.default,
              ""
            )}/${provider}/${search}`),
          20
        );
        router.back();*/
      }}
    >
      <div className="flex gap-10 items-center">
        <Flag locale={icon} width={24} height={24} />
        <div>{text}</div>
      </div>
    </button>
  );
};
