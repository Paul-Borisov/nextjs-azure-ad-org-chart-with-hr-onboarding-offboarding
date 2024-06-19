import "@radix-ui/themes/styles.css";
import { Cross2Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Button, Dialog, Theme } from "@radix-ui/themes";
import React, { ReactNode, useMemo, useState } from "react";
import Tooltip from "@/shared/components/Tooltip";
import { useTranslation } from "react-i18next";
import Utils from "@/shared/lib/utils";

const LevelDialog = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(Utils.isDarkMode());

  useMemo(() => {
    const observer = Utils.addMutationObserver(() =>
      setIsDarkMode(Utils.isDarkMode())
    );
    return () => observer.disconnect();
  }, []);

  return (
    <Theme className="max-h-fit" appearance={isDarkMode ? "dark" : "inherit"}>
      <Dialog.Root>
        <Dialog.Trigger>
          <Button
            className="!outline !outline-1 !outline-inherit print:!hidden !cursor-pointer"
            variant="soft"
          >
            <Tooltip content={t("changeLevels")}>
              <HamburgerMenuIcon />
            </Tooltip>
          </Button>
        </Dialog.Trigger>
        <Dialog.Content className="tablet:!max-w-[90vw]">
          <Dialog.Title>{t("changeLevels")}</Dialog.Title>
          <Dialog.Description className="pb-5 max-w-[70vw]">
            {t("changeLevelsDescription")}
          </Dialog.Description>
          {children}
          <Dialog.Close>
            <button
              className="hover:bg-gray-400 hover:text-white absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] items-center justify-center rounded-full focus:shadow-gray-600 focus:shadow-[0_0_0_1px]"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    </Theme>
  );
};

export default LevelDialog;
