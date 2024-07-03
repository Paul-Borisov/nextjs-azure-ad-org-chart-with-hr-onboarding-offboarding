"use server";

import { FormFields } from "@/shared/enums/formFields";
import { getAccessToken } from "./sharepoint.access";
import { getEmployeeData, getSiteUserId } from "./sharepoint.get";
import { getSharepointSettings } from "@/shared/lib/sharepointSettings";
import { getValueFromFormData } from "@/shared/lib/formUtils";
import { IAzureAccount } from "@/shared/interfaces/iAzureAccount";
import { IFormState } from "@/shared/interfaces/iFormState";
import { SharepointFields } from "@/shared/enums/sharepointFields";
import { SharepointMapper } from "@/shared/mappers/sharepointMapper";

const { listTitleEmployees, siteUrl } = getSharepointSettings();

export const addNewEmployee = async (
  account: IAzureAccount,
  formData: FormData,
  itUser: boolean
) => {
  const getValue = (name: string, allowEmpty: boolean = false) =>
    getValueFromFormData(formData, name, allowEmpty);

  try {
    const employeeId = getValue(FormFields.employeeId);
    const managerUpn = getValue(FormFields.managerUpn);
    const firstName = getValue(FormFields.firstName);
    const lastName = getValue(FormFields.lastName);
    const jobTitle = getValue(FormFields.jobTitle, true);
    const jobTitleLocal = jobTitle;
    const workPhone = getValue(FormFields.workPhone, true);
    const mobilePhone = getValue(FormFields.mobilePhone, true);
    const dateOfHire = getValue(FormFields.dateOfHire, true);
    const dateOfBirth = getValue(FormFields.dateOfBirth, true);
    const orgUnit = getValue(FormFields.orgUnit, true);
    const orgDepartment = getValue(FormFields.orgDepartment, true);
    const orgTeam = getValue(FormFields.orgTeam, true);

    const accessToken = await getAccessToken();
    const managerSiteUserId = await getSiteUserId(managerUpn, accessToken);
    if (!managerSiteUserId) {
      throw new Error(`Site user not found for the manager ${managerUpn}`);
    }

    const basePayload = {
      [SharepointFields.employeeId]: employeeId,
      [SharepointFields.firstName]: firstName,
      [SharepointFields.lastName]: lastName,
      [SharepointFields.displayName]: account.displayName,
      [SharepointFields.jobTitle]: jobTitle,
      [SharepointFields.jobTitleLocal]: jobTitleLocal,
      [SharepointFields.itUser]: itUser,
      [SharepointFields.manager + "Id"]: managerSiteUserId,
      [SharepointFields.workEmail]: account.userPrincipalName,
      [SharepointFields.workPhone]: workPhone,
      [SharepointFields.mobilePhone]: mobilePhone,
    };

    const managerData = await getEmployeeData(managerUpn, accessToken);
    const additionalPayload: any = {};
    const addFieldValue = (
      fieldName: SharepointFields,
      defaultFieldName?: SharepointFields
    ) =>
      (additionalPayload[fieldName] = managerData[fieldName]
        ? managerData[fieldName]
        : defaultFieldName
        ? managerData[defaultFieldName]
        : null);

    addFieldValue(SharepointFields.location);
    addFieldValue(SharepointFields.locationPostalCode);
    addFieldValue(SharepointFields.company);
    addFieldValue(SharepointFields.country);
    addFieldValue(SharepointFields.employeeType);
    addFieldValue(SharepointFields.homeCountry, SharepointFields.country);
    addFieldValue(SharepointFields.postOffice);
    addFieldValue(SharepointFields.postOfficeBox);
    addFieldValue(SharepointFields.streetAddress);
    addFieldValue(SharepointFields.orgAffiliation);
    addFieldValue(SharepointFields.orgUnit);
    addFieldValue(SharepointFields.orgDepartment);
    addFieldValue(SharepointFields.orgTeam);
    addFieldValue(SharepointFields.employeeMainStatus);
    addFieldValue(SharepointFields.employeeCategory);

    additionalPayload[SharepointFields.dateOfHire] = dateOfHire
      ? dateOfHire
      : null;
    additionalPayload[SharepointFields.dateOfBirth] = dateOfBirth
      ? dateOfBirth
      : null;

    // Overwrite org.level fields if any values for them specified explicitly in formData.
    // Ignore manager's data copy for them and reset orgAffiliation to avoid mismatches.
    const notEmpty = !!orgUnit || !!orgDepartment || !!orgTeam;
    if (notEmpty) {
      additionalPayload[SharepointFields.orgUnit] = orgUnit;
      additionalPayload[SharepointFields.orgDepartment] = orgDepartment;
      additionalPayload[SharepointFields.orgTeam] = orgTeam;
      additionalPayload[SharepointFields.orgAffiliation] = null;
    }

    const headers: HeadersInit = {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      //"IF-MATCH": "*",
      //"X-HTTP-Method": "POST",
    };
    let json = await fetch(
      `${siteUrl}/_api/web/lists/getByTitle('${listTitleEmployees}')/items`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ ...basePayload, ...additionalPayload }),
      }
    )
      .then((r) => r.json())
      .then((json) => json);

    let error = SharepointMapper.extractStandardError(json);
    if (error) {
      // Fallback: try to create new item only with most important fields
      json = await fetch(
        `${siteUrl}/_api/web/lists/getByTitle('${listTitleEmployees}')/items`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(basePayload),
        }
      )
        .then((r) => r.json())
        .then((json) => json);

      error = SharepointMapper.extractStandardError(json);
    }

    const id = json["Id"]?.toString();
    const returnValue: IFormState = {
      error: !!error || !id,
      listItemId: id,
      message: error || (!id ? "Undetermined error" : id),
    };

    return returnValue;
  } catch (e) {
    return { error: true, message: (e as any).message } as IFormState;
  }
};
