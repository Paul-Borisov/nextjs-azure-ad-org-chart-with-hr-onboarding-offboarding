"use server";

import { deleteAzureAdAccount, offboardAzureAdAccount } from "./users.offboard";
import { EnvSettings } from "@/shared/lib/envSettings";
import { FormFields } from "@/shared/enums/formFields";
import { getUserByUserPrincipalName } from "@/app/api/users/utils";
import { getValueFromFormData } from "@/shared/lib/formUtils";
import { IFormStateUpdate } from "@/shared/interfaces/iFormState";
import { FormStateMapper } from "@/shared/mappers/formStateMapper";
import { offboardEmployeeRecord } from "./sharepoint.offboard";
import { offboardLocalAdAccount } from "./users.offboardLocal";

export const offboardEmployee = async (_: unknown, formData: FormData) => {
  const getValue = (name: string, allowEmpty: boolean = false) =>
    getValueFromFormData(formData, name, allowEmpty);
  const displayName = getValue(FormFields.displayName);
  const userPrincipalName = getValue(FormFields.userPrincipalName);
  const disableAccount = getValue(FormFields.disableAccount, true) === "on";
  const removeAccount = getValue(FormFields.removeAccount, true) === "on";
  const testCreate = EnvSettings.testCreate;
  const testCreateError = EnvSettings.testCreateError;
  if (testCreate || testCreateError) {
    return generateTestResponse(testCreateError);
  }

  const promises: Promise<IFormStateUpdate>[] = [];
  if (EnvSettings.isSharepointEnabled && (disableAccount || removeAccount)) {
    promises.push(
      offboardEmployeeRecord(userPrincipalName, displayName, removeAccount)
    );
  }
  if (disableAccount) {
    const user = await getUserByUserPrincipalName(userPrincipalName);
    if (user?.id) {
      promises.push(offboardAzureAdAccount(user));
    }
    if (
      userPrincipalName &&
      EnvSettings.azureAutomationWebhookUpdateLocalAdUser
    ) {
      promises.push(
        offboardLocalAdAccount(user?.userPrincipalName || userPrincipalName)
      );
    }
  } else if (removeAccount) {
    const user = await getUserByUserPrincipalName(userPrincipalName);
    if (user?.id) {
      promises.push(deleteAzureAdAccount(user));
    }
    if (
      userPrincipalName &&
      EnvSettings.azureAutomationWebhookUpdateLocalAdUser
    ) {
      promises.push(
        offboardLocalAdAccount(
          user?.userPrincipalName || userPrincipalName,
          true
        )
      );
    }
  }

  const results = await Promise.all(promises);
  const returnValue = results.length
    ? FormStateMapper.reduceStateUpdate(results)
    : { error: false, message: "No actions required" };

  return returnValue;
};

const generateTestResponse = (testCreateError: boolean) => {
  const returnValue: IFormStateUpdate = {
    error: testCreateError,
    message: "OK",
  };
  return returnValue;
};
