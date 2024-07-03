import { DarkTheme, LightTheme } from "@/shared/lib/fluentUIThemes";
import {
  FontIcon,
  Panel,
  PanelType,
  ThemeProvider,
  TooltipHost,
} from "@fluentui/react";
import React, { Dispatch } from "react";
import { useClientDimensions } from "@/shared/hooks/useClientDimentions";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Utils from "@/shared/lib/utils";

//initializeIcons(); // Already registered by SearchBox.tsx

const SidePanelCreateNewEmployee = ({
  children,
  headerText,
  isOpen,
  setIsOpen,
}: {
  children: React.ReactNode;
  headerText: string;
  isOpen: boolean;
  setIsOpen: Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [clientWidth] = useClientDimensions();
  const { t } = useTranslation();
  const router = useRouter();

  if (!isOpen) return null;

  const isDarkMode = Utils.isDarkMode();

  return (
    <ThemeProvider theme={isDarkMode ? DarkTheme : LightTheme}>
      <Panel
        isOpen={isOpen}
        type={clientWidth < 640 ? PanelType.custom : PanelType.largeFixed}
        onDismiss={() => {
          // Next line disables the standard close behavior on ESC and on clicking Close button. Custom ChromeClose buton below sets setIsCustomPanelOpen(false)}
          return false;
        }}
        hasCloseButton={true}
        isBlocking={true}
        isHiddenOnDismiss={true}
        headerText={headerText}
        styles={{
          main: {
            //boxShadow:
            //  "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px",
            borderLeft: "1px solid #ccc",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          },
        }}
      >
        <div className="float-right cursor-pointer">
          <TooltipHost content={t("close")}>
            <FontIcon
              iconName={"ChromeClose"}
              onClick={() => {
                router.refresh();
                setIsOpen(false);
              }}
            />
          </TooltipHost>
        </div>
        {children}
      </Panel>
      {/* A trick to suppress undesired content shift to the right when fluent panel opens and body scrollbar disappears. */}
      {/* The class .main is defined in layout.tsx */}
      {/* UPDATE: fixed in a safer way, returned back to overflow-x: hidden in global.css */}
      {/* {isOpen && Utils.getScrollbarWidth() ? (
        <style
          dangerouslySetInnerHTML={{
            __html: `.main { margin-right: ${Utils.getScrollbarWidth()}px }`,
          }}
        />
      ) : null} */}
    </ThemeProvider>
  );
};

export default SidePanelCreateNewEmployee;
