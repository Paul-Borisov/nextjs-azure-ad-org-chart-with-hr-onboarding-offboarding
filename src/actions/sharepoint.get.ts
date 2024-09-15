"use server";

import { getAccessToken } from "./sharepoint.access";
import { getSharepointSettings } from "@/shared/lib/sharepointSettings";
import { SharepointFields } from "@/shared/enums/sharepointFields";
import { SharepointMapper } from "@/shared/mappers/sharepointMapper";

const { listTitleEmployees, siteUrl } = getSharepointSettings();

export const getEmployeeIds = async () => {
  const accessToken = await getAccessToken();
  const json = await fetch(
    `${siteUrl}/_api/web/lists/getByTitle('${listTitleEmployees}')/items?$select=Title&$orderby=Title%20desc&$top=5000`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    }
  )
    .then((r) => r.json())
    .then((json) => json);
  return SharepointMapper.extractEmployeeIds(json);
};

export const findEmployee = async (userPrincipalName: string) => {
  const accessToken = await getAccessToken();
  const filter = `${SharepointFields.workEmail} eq '${userPrincipalName}'`;
  const endpoint = `${siteUrl}/_api/web/lists/getByTitle('${listTitleEmployees}')/items?$filter=${filter}&$top=1`;
  const userRecord = await fetch(endpoint, {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
    },
  }).then((r) => r.json());
  const result = SharepointMapper.extractEmployeeProperties(
    userPrincipalName,
    userRecord
  );
  return result;
};

export const findEmployeeId = async (
  userPrincipalName: string,
  displayName: string
) => {
  const accessToken = await getAccessToken();
  const siteUserId = (await getSiteUserId(userPrincipalName)) || "";
  const mainFilter = /\d+/.test(siteUserId)
    ? `Sharepoint_x0020_IDId eq ${siteUserId} or `
    : "";
  const filter = `${mainFilter}${SharepointFields.workEmail} eq '${userPrincipalName}' or ${SharepointFields.displayName} eq '${displayName}'`;
  const endpoint = `${siteUrl}/_api/web/lists/getByTitle('${listTitleEmployees}')/items?$select=Id,Title&$filter=${filter}&$top=1`;

  const json = await fetch(endpoint, {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
    },
  })
    .then((r) => r.json())
    .then((json) => json);
  const result = SharepointMapper.extractEmployeeIdandListItemId(json);
  return result;
};

export const getNewEmployeeIdForManager = async (managerUpn: string) => {
  const employeeIds = await getEmployeeIds();
  const mostRecentEmployeeId = employeeIds.find((id) => /^\d+$/i.test(id));
  if (mostRecentEmployeeId) {
    const managerSiteUsetId = managerUpn
      ? await getSiteUserId(managerUpn)
      : undefined;
    const increment = 1;
    //const increment = new Date().getSeconds();
    return {
      employeeId: (
        Number.parseInt(mostRecentEmployeeId) + increment
      ).toString(),
      managerSiteUserId: managerSiteUsetId,
    };
  } else {
    return undefined;
  }
};

export const getSiteUserId = async (
  userPrincipalName: string,
  accessToken?: string
) => {
  if (!userPrincipalName) return undefined;
  if (!accessToken) {
    accessToken = await getAccessToken();
  }
  const json = await fetch(
    `${siteUrl}/_api/web/SiteUsers?$filter=(UserPrincipalName eq '${userPrincipalName.toLocaleLowerCase()}')&$select=Id`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    }
  )
    .then((r) => r.json())
    .then((json) => json);
  return SharepointMapper.extractUserId(json);
};

export const getEmployeeData = async (
  userPrincipalName: string,
  accessToken?: string
) => {
  if (!accessToken) {
    accessToken = await getAccessToken();
  }
  const siteUserId = await getSiteUserId(userPrincipalName, accessToken);
  const json = await fetch(
    `${siteUrl}/_api/web/lists/getByTitle('${listTitleEmployees}')/items?$filter=${SharepointFields.sharepointId}Id eq ${siteUserId}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    }
  )
    .then((r) => r.json())
    .then((json) => json);
  return SharepointMapper.extractFirstListItem(json);
};
