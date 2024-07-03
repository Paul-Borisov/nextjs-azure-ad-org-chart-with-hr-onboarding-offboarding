"use client";

import Link from "next/link";
import { supportedLocales } from "../lib/locales";
import Flag from "./Flag";
import { Theme } from "@radix-ui/themes";
import Tooltip from "./Tooltip";
import { usePathname } from "next/navigation";
import Utils from "@/shared/lib/utils";

const Locales = () => {
  let path = usePathname();
  for (let url of Object.values(supportedLocales)) {
    if (path.startsWith(url)) {
      path = path.substring(url.length);
      break;
    }
  }
  const pathname = Utils.stripSigninUrl(path);

  const isDarkMode = Utils.isDarkMode();
  const baseUrl = window.location.origin;

  return (
    <Theme appearance={isDarkMode ? "dark" : "inherit"}>
      <div className="flex gap-2 tablet:gap-0">
        {Object.keys(supportedLocales).map((locale: string, index: number) => (
          <Tooltip content={locale?.toUpperCase()} key={locale}>
            <Link href={`${baseUrl}${supportedLocales[locale]}${pathname}`}>
              <Flag locale={locale} />
            </Link>
          </Tooltip>
        ))}
      </div>
    </Theme>
  );
};

export default Locales;
