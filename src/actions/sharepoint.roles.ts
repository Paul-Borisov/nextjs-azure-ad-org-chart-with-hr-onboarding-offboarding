"use server";

import { getAccessToken } from "./sharepoint.access";
import { getSharepointSettings } from "@/shared/lib/sharepointSettings";

const { listTitleEmployees, listTitleEmployeeDocuments, siteUrl } =
  getSharepointSettings();

enum PermissionKind {
  addListItems = 2,
  editListItems = 3,
  fullMask = 65,
}

export const canAddListItems = async () => {
  if (!listTitleEmployees) return false;
  const userPermissions = await getListEffectivePermissions(listTitleEmployees);
  return hasPermissions(userPermissions, PermissionKind.addListItems);
};

export const canAddDocuments = async () => {
  if (!listTitleEmployeeDocuments) return false;
  const userPermissions = await getListEffectivePermissions(
    listTitleEmployeeDocuments
  );
  return hasPermissions(userPermissions, PermissionKind.addListItems);
};

export const canEditListItems = async () => {
  if (!listTitleEmployees) return false;
  const userPermissions = await getListEffectivePermissions(listTitleEmployees);
  return hasPermissions(userPermissions, PermissionKind.editListItems);
};

const getListEffectivePermissions = async (
  listTitle: string,
  accessToken?: string
) => {
  if (!accessToken) {
    accessToken = await getAccessToken();
  }
  const json = await fetch(
    `${siteUrl}/_api/web/lists/getByTitle('${listTitle}')/EffectiveBasePermissions`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  )
    .then((r) => r.json())
    .then((json) => json);
  return json;
};

export const hasPermissions = (
  value: { Low: number; High: number },
  perm: PermissionKind
): boolean => {
  if (!perm) {
    return true;
  }
  if (perm === PermissionKind.fullMask) {
    return (value.High & 32767) === 32767 && value.Low === 65535;
  }

  perm = perm - 1;
  let num = 1;

  if (perm >= 0 && perm < 32) {
    num = num << perm;
    return 0 !== (value.Low & num);
  } else if (perm >= 32 && perm < 64) {
    num = num << (perm - 32);
    return 0 !== (value.High & num);
  }
  return false;
};
