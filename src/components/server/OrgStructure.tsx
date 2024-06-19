import { AuthenticationProvider } from "@/shared/enums/authenticationProvider";
import ClientPhotos from "@/components/client/ClientPhotos";
import { ensureUsers } from "./orgStructure.users";
import { ensureUserPhotos } from "./orgStructure.userPhotos";
import HierarchyContainer from "../client/HierarchyContainer";
import { IHierarchyContext } from "@/components/contexts/iHierarchyContext";
import { orgStructureSettings } from "./orgStructure.settings";
import SidePanelContext from "../client/panels/SidePanelContext";
import UnitContainer from "../client/UnitContainer";
import Utils from "@/shared/lib/utils";
import { ViewType } from "@/components/enums/viewType";
import WarningDisabledCache from "../client/WarningDisabledCache";

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
      {viewType === ViewType.Hierarchy ? (
        <HierarchyContainer context={context} />
      ) : viewType === ViewType.Units ? (
        <UnitContainer context={context} />
      ) : null}
      {renderUserPhotoOnClient ? <ClientPhotos /> : null}
    </SidePanelContext>
  );
};

export default OrgStructure;
