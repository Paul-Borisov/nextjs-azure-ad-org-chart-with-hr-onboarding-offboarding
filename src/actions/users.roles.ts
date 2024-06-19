"use server";

import { auth } from "@/auth";
import { AzureRoleTemplates } from "@/shared/enums/azureRoleTemplates";
import { AzureMemberRoleMapper } from "@/shared/mappers/azureMemberRoleMapper";

export const canManageAzureUsers = async () => {
  const userRoles = await listUserAzureRoles();
  return !!(
    userRoles?.[AzureRoleTemplates.globalAdministrator] ||
    userRoles?.[AzureRoleTemplates.userAdministrator]
  );
};

const listUserAzureRoles = async () => {
  const session = await auth();
  if (!session) return undefined;

  // Required delegated permissions: Directory.Read.All to check for system roles like Global Administrator and User Administrator
  let endpoint = "https://graph.microsoft.com/v1.0/me/memberOf";
  const json = await fetch(endpoint, {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${session?.user.accessToken}`,
    },
    cache: "no-store",
  })
    .then((r) => r.json())
    .then((json) => json);
  return AzureMemberRoleMapper.mapMemberRoles(json);
};
