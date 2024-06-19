import { settings } from "@/shared/enums/settings";
import Utils from "@/shared/lib/utils";

export const getSharepointSettings = () => {
  const accessScopes = `${Utils.getStringSetting(
    settings.sharepointTenant
  )}/.default`;

  const listTitleEmployees = Utils.getStringSetting(
    settings.sharepointListTitleEmployees
  );

  const listTitleEmployeeDocuments = Utils.getStringSetting(
    settings.sharepointListTitleEmployeeDocuments
  );

  const siteUrl = `${Utils.getStringSetting(
    settings.sharepointTenant
  )}${Utils.getStringSetting(settings.sharepointSiteUrlHr)}`;

  const folderUrlEmployeeDocuments = `${Utils.getStringSetting(
    settings.sharepointSiteUrlHr
  )}/${Utils.getStringSetting(settings.sharepointFolderNameEmployeeDocuments)}`;

  return {
    accessScopes,
    folderUrlEmployeeDocuments,
    listTitleEmployees,
    listTitleEmployeeDocuments,
    siteUrl,
  };
};
