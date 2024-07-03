"use client";
import { ClientGlobalContext } from "@/shared/contexts/clientGlobalContext";
import { Constants } from "@/shared/lib/constants";
import Header from "./Header";
import Footer from "./Footer";
import { Provider as ReduxToolkitProvider } from "react-redux";
import { Resource } from "i18next";
import { SessionProvider } from "next-auth/react";
import { store } from "@/store/store";
import { ThemeProvider } from "next-themes";
import TranslationsProvider from "./TranslationsProvider";

export default function ClientRootLayout({
  children,
  locale,
  namespaces,
  resources,
  shouldUseMockupDataWhenUnauthenticated,
}: {
  children: React.ReactNode;
  locale: string;
  namespaces: string[];
  resources: Resource;
  shouldUseMockupDataWhenUnauthenticated: boolean;
}) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme={Constants.defaultTheme}>
        <TranslationsProvider
          namespaces={namespaces}
          locale={locale}
          resources={resources}
        >
          <ReduxToolkitProvider store={store}>
            <ClientGlobalContext.Provider
              value={{ shouldUseMockupDataWhenUnauthenticated }}
            >
              <Header />
            </ClientGlobalContext.Provider>
            {children}
            <Footer />
          </ReduxToolkitProvider>
        </TranslationsProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
