"use client";

import { createRef } from "react";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import { DarkTheme, LightTheme } from "@/shared/lib/fluentUIThemes";
import {
  SearchBox as FluentSearchBox,
  ThemeProvider,
  //setIconOptions,
} from "@fluentui/react";
import { useDebounced } from "@/shared/hooks/useDebounced";
import { useTranslation } from "react-i18next";
import Utils from "@/shared/lib/utils";
import { searchTextId } from "@/shared/lib/searchUtils";

//setIconOptions({ disableWarnings: true });
initializeIcons();

const SearchBox = () => {
  const { t } = useTranslation();
  const refSearchText = createRef<HTMLInputElement>();
  const debounced = useDebounced((value) => {
    if (refSearchText.current && refSearchText.current.value !== value) {
      refSearchText.current.value = value;
    }
  }, 1000);
  const isDarkMode = Utils.isDarkMode();

  return (
    <ThemeProvider
      theme={isDarkMode ? DarkTheme : LightTheme}
      className="tablet:hidden noheader:absolute noheader:mt-10"
    >
      <FluentSearchBox
        showIcon={false}
        styles={{
          root: { width: 220, paddingLeft: "10px" },
          iconContainer: { display: "none" },
        }}
        placeholder={t("searchPlaceholder")}
        onChange={(_, newValue) => debounced(newValue)}
        onClear={() => {
          if (refSearchText.current) refSearchText.current.value = "";
        }}
      />
      <input id={searchTextId} ref={refSearchText} type="hidden" />
    </ThemeProvider>
  );
};

export default SearchBox;
