import { AuthenticationProvider } from "@/shared/enums/authenticationProvider";
import { ensureUsers } from "./orgStructure.users";
import { ensureUserPhotos } from "./orgStructure.userPhotos";
import { EnvSettingsClient } from "@/shared/lib/envSettingsClient";
import { IHierarchyContext } from "@/components/contexts/iHierarchyContext";
import { orgStructureSettings } from "./orgStructure.settings";
import { PhotoStores } from "../enums/photoStores";
import SidePanelContext from "../client/panels/SidePanelContext";
import Utils from "@/shared/lib/utils";
import { ViewType } from "@/components/enums/viewType";
import WarningDisabledCache from "../client/WarningDisabledCache";
import WithClientPhotos from "@/components/client/hocs/WithClientPhotos";
import WithViewType from "../client/hocs/WithViewType";

const OrgStructure = async ({
  authenticationProvider,
  isAuthenticated,
  viewType,
}: {
  authenticationProvider?: AuthenticationProvider;
  isAuthenticated: boolean;
  viewType: ViewType;
}) => {
  const {
    cacheUseDatabase,
    collapseByDefault,
    collapseOnRoot,
    excludeUsers,
    isLocalAdEnabled,
    isSharepointEnabled,
    renderUserPhotoOnClient,
    renderUserPhotoOnServer,
    shouldUseMockupDataWhenAuthenticated,
    shouldUseMockupDataWhenAuthenticatedWithGoogle,
    shouldUseMockupDataWhenUnauthenticated,
    userCardAttributes,
  } = orgStructureSettings();

  const isMockup =
    (isAuthenticated && shouldUseMockupDataWhenAuthenticated) ||
    (!isAuthenticated && shouldUseMockupDataWhenUnauthenticated) ||
    (Utils.isGoogle(authenticationProvider) &&
      shouldUseMockupDataWhenAuthenticatedWithGoogle);

  const context: IHierarchyContext = {
    cacheUseDatabase,
    collapseByDefault,
    collapseOnRoot,
    excludeUsers,
    isMockup,
    isLocalAdEnabled,
    isSharepointEnabled,
    renderUserPhotoOnClient: isMockup ? false : renderUserPhotoOnClient,
    renderUserPhotoOnServer: isMockup ? false : renderUserPhotoOnServer,
    userCardAttributes,
    viewType,
  };

  const props = {
    isAuthenticated,
    authenticationProvider,
    shouldUseMockupDataWhenAuthenticated,
    shouldUseMockupDataWhenAuthenticatedWithGoogle,
    shouldUseMockupDataWhenUnauthenticated,
    ...context,
  };
  let allUsers = await ensureUsers(props);
  context.disabledCacheWarning = props.disabledCacheWarning;

  if (!isMockup) {
    await ensureUserPhotos({
      allUsers,
      cacheUseDatabase,
      renderUserPhotoOnClient,
      renderUserPhotoOnServer,
    });
  }

  return (
    <SidePanelContext context={context} data={allUsers}>
      {context.disabledCacheWarning ? (
        <WarningDisabledCache translationKey="warningDisabledCache" />
      ) : null}
      {context.isMockup ? (
        <WarningDisabledCache translationKey="warningMockupData" />
      ) : null}
      {renderUserPhotoOnClient ? (
        <WithClientPhotos
          store={
            EnvSettingsClient.shouldUseReduxStore ||
            EnvSettingsClient.shouldUseReduxQuery
              ? EnvSettingsClient.shouldUseReduxQuery
                ? PhotoStores.reduxWithQuery
                : PhotoStores.redux
              : PhotoStores.session
          }
        />
      ) : null}
      <WithViewType context={context} viewType={viewType} />
    </SidePanelContext>
  );
};

export default OrgStructure;
