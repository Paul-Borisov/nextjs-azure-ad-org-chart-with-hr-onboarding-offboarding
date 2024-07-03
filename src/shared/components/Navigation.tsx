"use client";
import { ClientGlobalContext } from "../contexts/clientGlobalContext";
import { i18nConfig } from "@/i18n.config";
import { getNavigationItems } from "./NavigationItems";
import Link from "next/link";
import { ReactNode, useContext, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import Utils from "@/shared/lib/utils";

interface INavigationItem {
  key: string;
  url: string;
  icon?: ReactNode;
}

export const Navigation = () => {
  const { t } = useTranslation();
  const items: INavigationItem[] = useMemo(() => getNavigationItems(t), []);
  const [path, setPath] = useState<string>();
  const { status } = useSession();
  const { shouldUseMockupDataWhenUnauthenticated } =
    useContext(ClientGlobalContext);

  const pathname = usePathname();
  useMemo(() => {
    const url = Utils.stripLocaleUrl(pathname);
    setPath(url ? url : "/");
  }, [pathname]);

  const isAuthenticated = status === "authenticated";

  const isDarkMode = Utils.isDarkMode();
  const baseUrl = window.location.origin;
  const getNavigationItemUrl = (item: INavigationItem) => {
    const url = `${baseUrl}${Utils.getLocaleUrl(
      window.location.pathname
    )}${Utils.stripTrailSlash(item.url)}`;
    if (
      !isAuthenticated &&
      item.url !== "/" &&
      !shouldUseMockupDataWhenUnauthenticated
    ) {
      return `${window.location.origin}${window.location.pathname}${
        window.location.pathname === "/" ? i18nConfig.defaultLocale : ""
      }/signin/default?callbackUrl=${encodeURIComponent(url)}`;
    } else {
      return url;
    }
  };
  const getLinkElement = (item: INavigationItem) => {
    const props = {
      href: getNavigationItemUrl(item),
      className: [
        "inline-flex items-center justify-center p-4 pt-0 whitespace-nowrap",
        //"border-b-2 tablet:border-none laptop:border-none tablet:pl-2 laptop:pl-2",
        "border-b-2",
        path === item.url
          ? !isDarkMode
            ? "text-blue-600 !border-blue-600"
            : "text-blue-300 !border-blue-300"
          : undefined,
        "border-gray-200 rounded-t-lg hover:border-gray-300",
        !isDarkMode ? "hover:text-gray-600" : "hover:text-gray-300",
      ]
        .join(" ")
        .trim(),
    };
    const body = (
      <>
        <span
          className={
            path === item.url
              ? !isDarkMode
                ? "[&>svg]:text-blue-600"
                : "[&>svg]:text-blue-300"
              : ""
          }
        >
          {item.icon}
        </span>
        <span className="laptop:hidden">{item.key}</span>
      </>
    );

    return (
      <Link
        // Link component is required to work with /signin intercepting route, which shows a modal popup to select a signin provider.
        // a-tag does not work with it.
        key={item.key} // Key must be specified explicitly to suppress console errors.
        {...props}
      >
        {body}
      </Link>
    );
  };

  return (
    <ul
      className={[
        "flex whitespace-nowrap -mb-px text-sm font-medium text-center",
        !isDarkMode ? "text-gray-500" : undefined,
      ]
        .join(" ")
        .trim()}
    >
      <li className="me-2">
        {items.map((item: INavigationItem) => getLinkElement(item))}
      </li>
    </ul>
  );
};
