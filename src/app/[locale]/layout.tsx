import "./globals.css";
import { Constants } from "@/shared/lib/constants";
import { dir } from "i18next";
import dynamic from "next/dynamic";
import { EnvSettings } from "@/shared/lib/envSettings";
import { headers } from "next/headers";
import i18nConfig from "@/i18n.config";
import initTranslations from "../i18n";
import { Inter } from "next/font/google";
import Utils from "@/shared/lib/utils";

const ClientRootLayout = dynamic(
  () => import("@/components/client/ClientRootLayout"),
  {
    ssr: false,
  }
);

const inter = Inter({ subsets: ["latin"] });
const i18nNamespaces = ["main"];

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const { t } = await initTranslations(locale, i18nNamespaces);
  const pathname = headers().get(Constants.headerPathname) as string;
  const titleKey = "appTitle";
  const descriptionKey = "appDescription";
  let titleValue = t(titleKey);
  let descriptionValue = t(descriptionKey);

  if (pathname) {
    const suffix = Utils.capitalizeAllWords(
      Utils.stripLocaleUrl(pathname).replace(/\//g, "")
    );
    const pathTitleKey = `${titleKey}${suffix}`;
    const pathDescriptionKey = `${descriptionKey}${suffix}`;
    const pathTitleValue = t(pathTitleKey);
    const pathDescriptionValue = t(pathDescriptionKey);
    if (pathTitleValue !== pathTitleKey) {
      titleValue = pathTitleValue;
    }
    if (pathDescriptionValue !== pathDescriptionKey) {
      descriptionValue = pathDescriptionValue;
    }
  }

  return {
    title: titleValue,
    description: descriptionValue,
  };
}

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const { resources } = await initTranslations(locale, i18nNamespaces);
  return (
    <html lang={locale} dir={dir(locale)} className="class">
      <body className={inter.className}>
        <div className="trans">
          <ClientRootLayout
            locale={locale}
            namespaces={i18nNamespaces}
            resources={resources}
            shouldUseMockupDataWhenUnauthenticated={
              EnvSettings.shouldUseMockupDataWhenUnauthenticated
            }
          >
            <main className="main">{children}</main>
          </ClientRootLayout>
        </div>
      </body>
    </html>
  );
}
