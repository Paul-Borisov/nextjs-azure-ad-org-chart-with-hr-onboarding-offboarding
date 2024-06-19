"use server";

import { AzureAccountMapper } from "@/shared/mappers/azureAccountMapper";
import { createAzureAccount } from "./users.create";
import { findEmployee } from "./sharepoint.get";
import { getUserByAttribute } from "@/prisma/users.get";
import { getUserPhotoFromDatabase } from "@/prisma/userPhotos.get";
import { EnvSettings } from "@/shared/lib/envSettings";
import { FormFields } from "@/shared/enums/formFields";
import { FormStateMapper } from "@/shared/mappers/formStateMapper";
import { getUserByUserPrincipalName } from "@/app/api/users/utils";
import { getValueFromFormData } from "@/shared/lib/formUtils";
import { IBaseAdAccountUpdate } from "@/shared/interfaces/iBaseAdAccountUpdate";
import { IFormState, IFormStateUpdate } from "@/shared/interfaces/iFormState";
import { saveUserPhotoToAzure } from "./users.photo";
import { updateEmployee as updateEmployeeRecordSp } from "./sharepoint.update";
import { updateLocalAdAccount } from "./users.updateLocal";
import { updateAzureAdAccount } from "./users.update";
import { createLocalAdAccount } from "./users.createLocal";

export const updateEmployee = async (_: unknown, formData: FormData) => {
  const getValue = (name: string, allowEmpty: boolean = false) =>
    getValueFromFormData(formData, name, allowEmpty);
  const employeeId = getValue(FormFields.employeeId);
  const listItemId = getValue(FormFields.listItemId, true);
  const addToAzure = getValue(FormFields.createAzureAccount, true) === "on";
  const addToLocalAd = getValue(FormFields.createLocalAdAccount, true) === "on";
  const updateAdAccount = getValue(FormFields.updateAdAccount, true) === "on";
  const selectedGroups = getValue(FormFields.selectedGroups, true)
    ? getValue(FormFields.selectedGroups, true).split(",")
    : undefined;
  const testCreate = EnvSettings.testCreate;
  const testCreateError = EnvSettings.testCreateError;
  const userPrincipalName = getValue(FormFields.userPrincipalName);
  if (testCreate || testCreateError) {
    return generateTestResponse(testCreateError);
  }

  const promises: Promise<IFormStateUpdate>[] = [];
  if (listItemId) {
    promises.push(
      updateEmployeeRecordSp(listItemId, employeeId, addToAzure || addToLocalAd)
    );
  }

  const isUserCreationRequired = addToAzure || addToLocalAd;
  const isUserRequired = updateAdAccount || isUserCreationRequired;
  const user = isUserRequired
    ? await getUserByUserPrincipalName(userPrincipalName)
    : undefined;

  if (updateAdAccount) {
    const account: IBaseAdAccountUpdate = {
      employeeId,
      userPrincipalName,
    };
    if (!user || user.onPremisesSyncEnabled) {
      promises.push(updateLocalAdAccount(account)); // No need to trace results of long running operation
    } else {
      promises.push(updateAzureAdAccount(account));
    }
  }

  const results = await Promise.all(promises);
  let mergedResult = results.length
    ? FormStateMapper.reduceStateUpdate(results)
    : { error: false, message: "No actions required" };

  let accountCreationResult: IFormState | undefined = undefined;
  if (isUserCreationRequired && !user) {
    const dbUser = EnvSettings.cacheUseDatabase
      ? await getUserByAttribute(
          FormFields.userPrincipalName,
          userPrincipalName
        )
      : undefined;
    if (dbUser) {
      const spUser = EnvSettings.isSharepointEnabled
        ? await findEmployee(userPrincipalName)
        : undefined;

      const userPhotoBase64 = await getUserPhotoFromDatabase(
        dbUser.id,
        new Date(1980, 0, 1)
      );

      const account = AzureAccountMapper.mapFromUser(dbUser);
      account.employeeId = employeeId;
      if (spUser) {
        account.employeeId = account.employeeId || spUser.employeeId;
        account.mobilePhone = spUser.mobilePhone;
        account.businessPhones = spUser.businessPhones;
        if (spUser.givenName) account.givenName = spUser.givenName;
        if (spUser.surname) account.surname = spUser.surname;
      }
      const managerUpn = dbUser.managerUpn || "";
      if (addToAzure) {
        accountCreationResult = await createAzureAccount(
          account,
          managerUpn,
          selectedGroups
        );
        if (accountCreationResult && !accountCreationResult.error) {
          getUserByUserPrincipalName(userPrincipalName).then(
            (createdAccount) => {
              if (createdAccount) {
                if (userPhotoBase64) {
                  const arrayBuffer = Buffer.from(userPhotoBase64, "base64");
                  saveUserPhotoToAzure(createdAccount.id, arrayBuffer);
                }
              }
            }
          );
        }
      } else if (addToLocalAd) {
        accountCreationResult = await createLocalAdAccount(
          account,
          managerUpn,
          selectedGroups,
          userPhotoBase64 || ""
        );
      }
    }
  }

  const returnValue: IFormState = {
    //listItemId
    newUserPrincipalName: accountCreationResult?.newUserPrincipalName,
    newPassword: accountCreationResult?.newPassword,
    ...mergedResult,
  };
  return returnValue;
};

const generateTestResponse = (testCreateError: boolean) => {
  const returnValue: IFormState = {
    error: testCreateError,
    message: "OK",
  };
  return returnValue;
};
