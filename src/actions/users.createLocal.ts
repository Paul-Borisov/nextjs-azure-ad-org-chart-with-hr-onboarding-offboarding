"use server";

import { auth } from "@/auth";
import { canManageAzureUsers } from "./users.roles";
import { EnvSettings } from "@/shared/lib/envSettings";
import { IAzureAccount } from "@/shared/interfaces/iAzureAccount";
import { IBaseAdAccount } from "@/shared/interfaces/iBaseAdAccount";
import { IFormState } from "@/shared/interfaces/iFormState";
import Utils from "@/shared/lib/utils";

export const createLocalAdAccount = async (
  account: IAzureAccount,
  managerUpn: string,
  selectedGroups: string[] | undefined,
  userPhoto: string
) => {
  try {
    const session = await auth();
    if (!(await canManageAzureUsers())) throw Error("403 Access denied");

    const password = Utils.generatePassword();
    const endpoint = EnvSettings.azureAutomationWebhookCreateLocalAdUser;
    let payload: IBaseAdAccount = {
      accountEnabled: !EnvSettings.disableNewAccountWhenCreated,
      displayName: account.displayName,
      employeeId: account.employeeId ? account.employeeId : undefined,
      givenName: account.givenName,
      mail: account.userPrincipalName,
      manager: managerUpn,
      mobile: account.mobilePhone ? account.mobilePhone : undefined,
      telephoneNumber: account.businessPhones?.length
        ? account.businessPhones.join(",")
        : undefined,
      password: password,
      sn: account.surname,
      title: account.jobTitle ? account.jobTitle : undefined,
      userPrincipalName: account.userPrincipalName,
    };
    if (selectedGroups?.length) payload.selectedGroups = selectedGroups;
    if (userPhoto) payload.photo = userPhoto;
    if (account.onPremisesExtensionAttributes) {
      payload = { ...payload, ...account.onPremisesExtensionAttributes };
    }

    const json = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${session?.user.accessToken}`,
      },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((json) => json);

    const error = json["error"];
    const returnValue: IFormState = {
      error: !!error,
      message: error ? JSON.stringify(json) : "Submitted",
      newPassword: !error ? password : undefined,
    };
    return returnValue;
  } catch (e) {
    return { error: true, message: (e as any).message } as IFormState;
  }
};
