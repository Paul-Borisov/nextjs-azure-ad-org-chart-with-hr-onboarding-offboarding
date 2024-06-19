"use server";

import { EnvSettings } from "@/shared/lib/envSettings";
import { FormFields } from "@/shared/enums/formFields";
import { getAccessToken } from "./sharepoint.access";
import { getSharepointSettings } from "@/shared/lib/sharepointSettings";
import { IFormValue } from "@/shared/interfaces/iFormValue";
import { SharepointFields } from "@/shared/enums/sharepointFields";
import { SharepointMapper } from "@/shared/mappers/sharepointMapper";
import { updateFileMetadata } from "./sharepoint.update";

const { folderUrlEmployeeDocuments, siteUrl } = getSharepointSettings();

const uploadFile = async (
  fileName: string,
  content: ArrayBuffer,
  folderUrl: string = folderUrlEmployeeDocuments,
  accessToken?: string
) => {
  accessToken = accessToken || (await getAccessToken());
  let endpoint = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderUrl}')/files/add(url='${fileName}',overwrite=true)`;

  const headers: HeadersInit = {
    accept: "application/json;odata=nometadata",
    authorization: `Bearer ${accessToken}`,
    //"IF-MATCH": "*",
    //"X-HTTP-Method": "POST",
    //"Content-Length": content.byteLength.toString(),
  };
  const json = await fetch(endpoint, {
    method: "POST",
    headers: headers,
    body: content,
  })
    .then((r) => r.json())
    .then((json) => json);

  const error = SharepointMapper.extractStandardError(json);
  if (error) {
    return SharepointMapper.extractStandardError(json);
  } else {
    return undefined;
  }
};

export const uploadFiles = async (formData: FormData) => {
  const testCreate = EnvSettings.testCreate;
  const testCreateError = EnvSettings.testCreateError;

  const userPrincipalName =
    formData.get(FormFields.userPrincipalName)?.toString() || "";
  if (testCreate || testCreateError) {
    return {
      error: testCreateError,
      message: !testCreateError ? "OK" : "Upload error",
    };
  }

  const accessToken = await getAccessToken();
  const fileNames = formData.keys();
  const listItemId = formData.get(FormFields.listItemId) as string;
  const allErrors: string[] = [];
  while (true) {
    const fileNameEntry = fileNames.next();
    if (fileNameEntry.done) break;

    const fileName = fileNameEntry.value;
    if (Object.keys(FormFields).some((fieldName) => fieldName === fileName))
      continue;

    const file = formData.get(fileName) as File;
    let error = await uploadFile(
      fileName,
      await file.arrayBuffer(),
      undefined,
      accessToken
    );

    if (error) {
      allErrors.push(error);
    } else {
      const metadata: IFormValue[] = [
        { FieldName: SharepointFields.employee, FieldValue: listItemId }, // "845"
      ];

      error = await updateFileMetadata(
        fileName,
        metadata,
        undefined,
        accessToken
      );
      if (error) allErrors.push(error);
    }
  }
  return {
    error: allErrors.length > 0,
    message: !allErrors.length ? "OK" : allErrors.join("\n"),
  };
};
