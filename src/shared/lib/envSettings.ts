import { auth } from "@/auth";
import { settings } from "@/shared/enums/settings";
import Utils from "@/shared/lib/utils";

export class EnvSettings {
  static azureAdClientId = Utils.getStringSetting(settings.azureAdClientId);

  static azureAdClientSecret = Utils.getStringSetting(
    settings.azureAdClientSecret
  );

  static azureAdGraphQueryUsers = Utils.getStringSetting(
    settings.azureAdGraphQueryUsers
  );

  static azureAdPermissions = Utils.getStringSetting(
    settings.azureAdPermissions
  );

  static azureAdTenantId = Utils.getStringSetting(settings.azureAdTenantId);

  static azureAutomationWebhookCreateLocalAdUser = Utils.getStringSetting(
    settings.azureAutomationWebhookCreateLocalAdUser
  );

  static azureAutomationWebhookUpdateLocalAdUser = Utils.getStringSetting(
    settings.azureAutomationWebhookUpdateLocalAdUser
  );

  static cacheTimeoutInSeconds = parseInt(
    Utils.getStringSetting(settings.cacheTimeoutInSeconds)
  );

  static cacheTimeoutMultiplierForPhoto = parseInt(
    Utils.getStringSetting(settings.cacheTimeoutMultiplierForPhoto)
  );

  static cacheUseDatabase = Utils.getBoolSetting(settings.cacheUseDatabase);

  static disableNewAccountWhenCreated = Utils.getBoolSetting(
    settings.disableNewAccountWhenCreated
  );

  static googleClientId = Utils.getStringSetting(settings.googleClientId);

  static googleClientSecret = Utils.getStringSetting(
    settings.googleClientSecret
  );

  static isSharepointEnabled = !!Utils.getStringSetting(
    settings.sharepointTenant
  );

  static nextAuthSecret = Utils.getStringSetting(settings.nextAuthSecret);

  static testCreate = Utils.getBoolSetting(settings.testCreate);

  static testCreateError = Utils.getBoolSetting(settings.testCreateError);

  static shouldUseMockupDataWhenUnauthenticated = Utils.getBoolSetting(
    settings.shouldUseMockupDataWhenUnauthenticated
  );
}
