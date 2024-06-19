"use client";
import { Switch, Theme } from "@radix-ui/themes";
import Tooltip from "@/shared/components/Tooltip";
import { useTheme } from "next-themes";
import Utils from "@/shared/lib/utils";
import { useTranslation } from "react-i18next";

const ThemeSwitch = ({ refresh }: { refresh: () => void }) => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const isDarkMode = Utils.isDarkMode();

  return (
    <Theme appearance={isDarkMode ? "dark" : "inherit"}>
      <Tooltip content={t("darkMode")}>
        <Switch
          className="!cursor-pointer before:!cursor-pointer"
          defaultChecked={theme === "dark"}
          variant="soft"
          onCheckedChange={() => {
            setTheme(!theme || theme === "light" ? "dark" : "light");
            refresh();
          }}
        />
      </Tooltip>
    </Theme>
  );
};

export default ThemeSwitch;
