"use client";
import { Switch, Theme } from "@radix-ui/themes";
import Tooltip from "@/shared/components/Tooltip";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import useThemeMutationObserver from "@/shared/hooks/useThemeMutationObserver";

const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();
  const isDarkMode = useThemeMutationObserver();
  const { t } = useTranslation();

  return (
    <Theme appearance={isDarkMode ? "dark" : "inherit"}>
      <Tooltip content={t("darkMode")}>
        <Switch
          className="!cursor-pointer before:!cursor-pointer"
          defaultChecked={theme === "dark"}
          variant="soft"
          onCheckedChange={() => {
            setTheme(!theme || theme === "light" ? "dark" : "light");
          }}
        />
      </Tooltip>
    </Theme>
  );
};

export default ThemeSwitch;
