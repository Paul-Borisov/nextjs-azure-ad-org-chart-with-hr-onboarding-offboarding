import { auth } from "@/auth";
import { EnvSettings } from "@/shared/lib/envSettings";
import initTranslations from "@/app/i18n";
import Loading from "@/shared/components/Loading";
import LocalizableClientComponent from "@/components/client/LocalizableClientComponent";
import OrgStructure from "@/components/server/OrgStructure";
import { Suspense } from "react";
import Utils from "@/shared/lib/utils";
import { ViewType } from "@/components/enums/viewType";

export default async function ContentPanel({
  headerKey,
  locale,
  viewType,
}: {
  headerKey: string;
  locale: string;
  viewType: ViewType;
}) {
  const i18nNamespaces = ["main"];
  const { t } = await initTranslations(locale, i18nNamespaces);
  const session = await auth();

  const isAllowed =
    session?.user?.name || EnvSettings.shouldUseMockupDataWhenUnauthenticated;
  const isAuthenticated = !!session?.user?.name;
  const authenticationProvider = Utils.getAuthenticationProvider(session);

  return (
    <>
      <div className="flex justify-center font-extrabold gap-1 pt-5 print:pt-0 tablet:pt-16 tablet:pl-3 tablet:justify-start">
        <div className="fixed z-10">
          {isAllowed ? (
            <div className="flex gap-1 opacity-100 noheader:opacity-0 z-10">
              <div>{t(headerKey)}</div>
              <LocalizableClientComponent />
            </div>
          ) : (
            <div className="noheader:pt-12 z-10">
              {t("headerUnauthenticated")}
            </div>
          )}
        </div>
      </div>
      {isAllowed ? (
        <div className="max-w-fit min-w-[35vw] mx-auto pt-5 print:pt-0">
          <Suspense
            fallback={
              <div className="p-10">
                <Loading text={`${t("loadingEmployees")}...`} />
              </div>
            }
          >
            <OrgStructure
              isAuthenticated={isAuthenticated}
              authenticationProvider={authenticationProvider}
              viewType={viewType}
            />
          </Suspense>
        </div>
      ) : null}
    </>
  );
}
