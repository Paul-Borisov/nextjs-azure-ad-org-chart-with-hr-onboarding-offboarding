import { EnvSettings } from "@/shared/lib/envSettings";
import { settings } from "@/shared/enums/settings";
import Utils from "@/shared/lib/utils";

export const orgStructureSettings = () => {
  const cacheUseDatabase = Utils.getBoolSetting(settings.cacheUseDatabase);
  const collapseOnRoot = Utils.getBoolSetting(settings.treeViewCollapseOnRoot);
  const collapseByDefault = Utils.getBoolSetting(
    settings.treeViewCollapseByDefault
  );
  const excludeUsers =
    Utils.getStringSetting(settings.excludeUsers)?.split(",") || [];
  const isLocalAdEnabled = !!Utils.getStringSetting(
    settings.azureAutomationWebhookCreateLocalAdUser
  );
  const isSharepointEnabled = !!Utils.getStringSetting(
    settings.sharepointTenant
  );
  let renderUserPhotoOnClient = Utils.getBoolSetting(
    settings.renderUserPhotoOnClient
  );
  let renderUserPhotoOnServer = Utils.getBoolSetting(
    settings.renderUserPhotoOnServer
  );
  const shouldUseMockupDataWhenAuthenticated = Utils.getBoolSetting(
    settings.shouldUseMockupDataWhenAuthenticated
  );
  const shouldUseMockupDataWhenAuthenticatedWithGoogle = Utils.getBoolSetting(
    settings.shouldUseMockupDataWhenAuthenticatedWithGoogle
  );
  const shouldUseMockupDataWhenUnauthenticated =
    EnvSettings.shouldUseMockupDataWhenUnauthenticated;
  const userCardAttributes = Utils.getStringArraySetting(
    settings.userCardAttributes
  );

  return {
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
  };
};
