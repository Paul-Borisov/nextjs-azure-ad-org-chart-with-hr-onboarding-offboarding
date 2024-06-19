"use server";

import { auth } from "@/auth";
import { canAddDocuments, canAddListItems } from "./sharepoint.roles";
import { canManageAzureUsers } from "./users.roles";
import { EnvSettings } from "@/shared/lib/envSettings";
import Utils from "@/shared/lib/utils";
import { AuthenticationProvider } from "@/shared/enums/authenticationProvider";

export interface IPermittedUserActions {
  canManageAzureAccounts: boolean;
  canAddToSharepointList: boolean;
  canAddToSharepointLibrary: boolean;
}

export const getPermittedUserActions = async () => {
  const promises: Promise<boolean>[] = [];
  promises.push(canManageAzureUsers());

  const session = await auth();
  if (
    EnvSettings.isSharepointEnabled &&
    Utils.getAuthenticationProvider(session) ===
      AuthenticationProvider.microsoftEntraId
  ) {
    promises.push(canAddListItems());
    promises.push(canAddDocuments());
  }
  const results = await Promise.all(promises);
  const returnValue: IPermittedUserActions = {
    canManageAzureAccounts: results.length > 0 ? !!results[0] : false,
    canAddToSharepointList: results.length > 1 ? !!results[1] : false,
    canAddToSharepointLibrary: results.length > 2 ? !!results[2] : false,
  };

  return returnValue;
};
