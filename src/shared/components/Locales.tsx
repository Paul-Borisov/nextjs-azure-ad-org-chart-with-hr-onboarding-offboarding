"use client";

import Link from "next/link";
import { useMemo } from "react";
import { supportedLocales } from "../lib/locales";
import Flag from "./Flag";
import { Theme } from "@radix-ui/themes";
import Tooltip from "./Tooltip";
import Utils from "@/shared/lib/utils";

const Locales = () => {
  const pathname = useMemo(() => {
    let path = window.location.pathname;
    for (let url of Object.values(supportedLocales)) {
      if (path.startsWith(url)) {
        path = path.substring(url.length);
        break;
      }
    }
    return Utils.stripSigninUrl(path);
  }, []);

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
