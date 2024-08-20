import "@radix-ui/themes/styles.css";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button, Dialog, Theme } from "@radix-ui/themes";
import React, { ReactNode, useMemo, useRef } from "react";
import useThemeMutationObserver from "@/shared/hooks/useThemeMutationObserver";

const ConfirmationDialog = ({
  children,
  confirmedAction,
  bodyText,
  buttonTextConfirm,
  buttonTextCancel,
  headerText,
}: {
  children: ReactNode;
  confirmedAction: () => void;
  bodyText: string;
  buttonTextConfirm: string;
  buttonTextCancel: string;
  headerText: string;
}) => {
  const isDarkMode = useThemeMutationObserver();
  const refClose = useRef<HTMLButtonElement>(null);

  return (
    <Theme className="max-h-fit" appearance={isDarkMode ? "dark" : "inherit"}>
      <Dialog.Root>
        <Dialog.Trigger>{children}</Dialog.Trigger>
        <Dialog.Content className="tablet:!max-w-[90vw]">
          <Dialog.Title>{headerText}</Dialog.Title>
          <Dialog.Description className="pb-5 max-w-[70vw]">
            {bodyText}
          </Dialog.Description>
          <div className="flex gap-3 justify-center">
            <Button
              type="button"
              className="!w-40 !whitespace-nowrap"
              onClick={() => confirmedAction()}
            >
              {buttonTextConfirm}
            </Button>
            <Button
              type="button"
              className="!w-40 !whitespace-nowrap"
              onClick={() => refClose.current?.click()}
            >
              {buttonTextCancel}
            </Button>
          </div>
          <Dialog.Close>
            <button
              ref={refClose}
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

export default ConfirmationDialog;
