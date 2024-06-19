"use server";

import { getAccessToken } from "./sharepoint.access";
import { getSharepointSettings } from "@/shared/lib/sharepointSettings";
import { IFormStateUpdate } from "@/shared/interfaces/iFormState";
import { IFormValue } from "@/shared/interfaces/iFormValue";
import { SharepointMapper } from "@/shared/mappers/sharepointMapper";
import { SharepointFields } from "@/shared/enums/sharepointFields";
import { SharepointFieldValues } from "@/shared/enums/sharepointFieldValues";

const { listTitleEmployees, folderUrlEmployeeDocuments, siteUrl } =
  getSharepointSettings();

export const updateFileMetadata = async (
  fileName: string,
  metadata: IFormValue[],
  folderUrl: string = folderUrlEmployeeDocuments,
  accessToken?: string
) => {
  accessToken = accessToken || (await getAccessToken());
  let endpoint = `${siteUrl}/_api/web/GetFileByServerRelativeUrl('${folderUrl}/${fileName}')/ListItemAllFields/ValidateUpdateListItem`;
  const headers: HeadersInit = {
    accept: "application/json;odata=nometadata",
    authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json;odata=nometadata",
    //"IF-MATCH": "*",
    //"X-HTTP-Method": "POST",
    //"Content-Length": content.byteLength.toString(),
  };

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
    return errors.join("\n");
  } else {
    return undefined;
  }
};

export const updateEmployee = async (
  listItemId: string,
  employeeId: string,
  itUser: boolean,
  accessToken?: string
): Promise<IFormStateUpdate> => {
  accessToken = accessToken || (await getAccessToken());
  let endpoint = `${siteUrl}/_api/web/lists/getByTitle('${listTitleEmployees}')/items(${listItemId})/ValidateUpdateListItem`;
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
      FieldName: SharepointFields.employeeId,
      FieldValue: employeeId,
    },
  ];
  if (itUser) {
    metadata.push({
      FieldName: SharepointFields.itUser,
      FieldValue: SharepointFieldValues.itUserEnabled,
    });
  }
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
    const returnValue: IFormStateUpdate = {
      error: true,
      message: errors.join("\n"),
    };
    return returnValue;
  } else {
    const returnValue: IFormStateUpdate = { error: false, message: employeeId };
    return returnValue;
  }
};
