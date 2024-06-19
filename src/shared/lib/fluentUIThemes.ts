import { ICheckboxStyles, createTheme } from "@fluentui/react";

const checkboxStylesDarkTheme: ICheckboxStyles = {
  checkbox: {
    background: "transparent !important",
    borderColor: "white !important",
  },
  checkmark: {
    color: "white",
    fontWeight: 900,
  },
};

const checkboxStylesLightTheme: ICheckboxStyles = {
  checkbox: {
    background: "transparent !important",
    borderColor: "gray !important",
  },
  checkmark: {
    color: "blue",
    fontWeight: 900,
  },
};

// https://fabricweb.z5.web.core.windows.net/pr-deploy-site/refs/heads/7.0/theming-designer/index.html

export const DarkTheme = createTheme({
  palette: {
    themePrimary: "#0078d4",
    themeLighterAlt: "#eff6fc",
    themeLighter: "#deecf9",
    themeLight: "#c7e0f4",
    themeTertiary: "#71afe5",
    themeSecondary: "#2b88d8",
    themeDarkAlt: "#106ebe",
    themeDark: "#005a9e",
    themeDarker: "#004578",
    neutralLighterAlt: "#1c1c1c",
    neutralLighter: "#252525",
    neutralLight: "#343434",
    neutralQuaternaryAlt: "#3d3d3d",
    neutralQuaternary: "#454545",
    neutralTertiaryAlt: "#656565",
    neutralTertiary: "#c8c8c8",
    neutralSecondary: "#d0d0d0",
    neutralPrimaryAlt: "#dadada",
    neutralPrimary: "#ffffff",
    neutralDark: "#f4f4f4",
    black: "#f8f8f8",
    white: "#121212",
  },
  components: {
    Checkbox: {
      styles: checkboxStylesDarkTheme,
    },
  },
});

export const LightTheme = createTheme({
  palette: {
    themePrimary: "#0078d4",
    themeLighterAlt: "#eff6fc",
    themeLighter: "#deecf9",
    themeLight: "#c7e0f4",
    themeTertiary: "#71afe5",
    themeSecondary: "#2b88d8",
    themeDarkAlt: "#106ebe",
    themeDark: "#005a9e",
    themeDarker: "#004578",
    neutralLighterAlt: "#ffffff",
    neutralLighter: "#ffffff",
    neutralLight: "#ffffff",
    neutralQuaternaryAlt: "#ffffff",
    neutralQuaternary: "#ffffff",
    neutralTertiaryAlt: "#ffffff",
    neutralTertiary: "#595959",
    neutralSecondary: "#373737",
    neutralPrimaryAlt: "#2f2f2f",
    neutralPrimary: "#000000",
    neutralDark: "#151515",
    black: "#0b0b0b",
    white: "#ffffff",
  },
  components: {
    Checkbox: {
      styles: checkboxStylesLightTheme,
    },
  },
});
