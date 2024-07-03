// NOT IN USE
"use server";

import { getAccessToken } from "./sharepoint.access";
import { getSharepointSettings } from "@/shared/lib/sharepointSettings";
import { SharepointFields } from "@/shared/enums/sharepointFields";
import { SharepointMapper } from "@/shared/mappers/sharepointMapper";
import { SharepointFieldValues } from "@/shared/enums/sharepointFieldValues";

const { listTitleEmployees, siteUrl } = getSharepointSettings();

export const getOrgUnits = async () => {
  const accessToken = await getAccessToken();
  const json = await fetch(
    `${siteUrl}/_api/web/lists/getByTitle('${listTitleEmployees}')/items` +
      `?$filter=${SharepointFields.employeeMainStatus} eq '${SharepointFieldValues.employeeMainStatusActive}'` +
      `&$select=${SharepointFields.orgUnit},${SharepointFields.orgDepartment},${SharepointFields.orgTeam}&$top=5000`,
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
  return SharepointMapper.extractOrgUnits(json);
};
