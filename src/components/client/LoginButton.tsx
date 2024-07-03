import Image from "next/image";
import Link from "next/link";
import { SigninHelper } from "@/shared/lib/signinHelper";
import { Theme, Tooltip } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useSession, signOut } from "next-auth/react";
import { useMemo } from "react";
import Utils from "@/shared/lib/utils";
import { Initials } from "./Initials";

export const LoginButton = () => {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const isDarkMode = Utils.isDarkMode();
  //const localePath = "/" + document.querySelector("html")?.lang ?? "";

  const userImage = useMemo(() => {
    return (
      <div>
        {session?.user?.image ? (
          <div className="w-10 h-10">
            {session?.user?.image && session?.user?.name ? (
              <Image
                src={session.user.image}
                alt={session.user.name}
                height={40}
                width={40}
                className="rounded-3xl"
              />
            ) : null}
          </div>
        ) : (
          <Initials
            title={session?.user?.name || ""}
            className="!w-10 !h-10 !text-sm"
          />
        )}
      </div>
    );
  }, [session?.user?.image, session?.user?.name]);

  return (
    <>
      {session?.user?.email ? (
        <Theme appearance={isDarkMode ? "dark" : "light"}>
          <Tooltip content={session.user.email}>{userImage}</Tooltip>
        </Theme>
      ) : session ? (
        userImage
      ) : (
        <div className="invisible">{userImage}</div>
      )}
      {status === "unauthenticated" ? (
        // The handling logic is located in ModalSignin.tsx, which is loaded by the intercepting route (.)signin/[provider].
        <Link
          href={
            window.navigator.onLine
              ? SigninHelper.getSigninUrlWithCallbackUrl()
              : `/signin?callbackUrl=${encodeURIComponent(
                  window.location.origin
                )}&error=${t("noInternet")}`
          }
          className="self-center tablet:absolute"
        >
          {t("signin")}
        </Link>
      ) : (
        <div className="flex flex-col text-xs self-center">
          {session?.user?.name ? <div>{session.user.name}</div> : null}
          <Link href={"#"} onClick={() => signOut()}>
            {t("signout")}
          </Link>
        </div>
      )}
    </>
  );
};
