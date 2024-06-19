"use server";

import { canEditListItems } from "./sharepoint.roles";
import { findEmployeeId } from "./sharepoint.get";
import { getAccessToken } from "./sharepoint.access";
import { getSharepointSettings } from "@/shared/lib/sharepointSettings";
import type { IFormStateUpdate } from "@/shared/interfaces/iFormState";
import { IFormValue } from "@/shared/interfaces/iFormValue";
import { SharepointFields } from "@/shared/enums/sharepointFields";
import { SharepointFieldValues } from "@/shared/enums/sharepointFieldValues";
import { SharepointMapper } from "@/shared/mappers/sharepointMapper";

const { listTitleEmployees, siteUrl } = getSharepointSettings();

export const offboardEmployeeRecord = async (
  userPrincipalName: string,
  displayName: string,
  removeAccount: boolean = false,
  accessToken?: string
): Promise<IFormStateUpdate> => {
  accessToken = accessToken || (await getAccessToken());
  const canEdit = await canEditListItems();
  if (!canEdit) {
    return { error: false, message: "" }; // No access, skip this update
  }
  const employee = await findEmployeeId(userPrincipalName, displayName);
  if (!employee) {
    return { error: false, message: "SP: employee record not found, skipped" };
  }

  let endpoint = `${siteUrl}/_api/web/lists/getByTitle('${listTitleEmployees}')/items(${employee.listItemId})/ValidateUpdateListItem`;
  const headers: HeadersInit = {
    accept: "application/json;odata=nometadata",
    authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json;odata=nometadata",
    //"IF-MATCH": "*",
    //"X-HTTP-Method": "POST",
    //"Content-Length": content.byteLength.toString(),
  };

  const metadata: IFormValue[] = [
    {
      FieldName: SharepointFields.employeeMainStatus,
      FieldValue: SharepointFieldValues.employeeMainStatusInactive,
    },
    {
      FieldName: SharepointFields.employeeStatus,
      FieldValue: removeAccount
        ? SharepointFieldValues.employeeStatusRemoved
        : SharepointFieldValues.employeeStatusDisabled,
    },
    {
      FieldName: SharepointFields.excludeFromOrgChart,
      FieldValue: SharepointFieldValues.excludeFromOrgChartEnabled,
    },
  ];
  const formValues = metadata.map((formValue) => ({
    ErrorMessage: null,
    HasException: false,
    ...formValue,
  }));
  const payload = JSON.stringify({
    formValues,
    bNewDocumentUpdate: true,
  });

  const json = await fetch(endpoint, {
    method: "POST",
    headers: headers,
    body: payload,
  })
    .then((r) => r.json())
    .then((json) => json);

  const errors = SharepointMapper.extractAllErrorsForSystemUpdateResults(json);
  if (errors) {
    return { error: true, message: errors.join("\n") };
  } else {
    return { error: false, message: "SP: offboarded" };
  }
};
