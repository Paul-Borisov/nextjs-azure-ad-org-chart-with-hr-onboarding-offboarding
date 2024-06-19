"use server";

import { auth } from "@/auth";
import { canManageAzureUsers } from "./users.roles";
import { EnvSettings } from "@/shared/lib/envSettings";
import { IFormStateUpdate } from "@/shared/interfaces/iFormState";

export const offboardLocalAdAccount = async (
  userPrincipalName: string,
  removeAccount: boolean = false
) => {
  try {
    const session = await auth();
    const canManage = await canManageAzureUsers();
    if (!canManage || !userPrincipalName) {
      return { error: false, message: "" }; // No access, skip this update
    }

    const endpoint = EnvSettings.azureAutomationWebhookUpdateLocalAdUser;
    let payload = removeAccount
      ? {
          userPrincipalName: userPrincipalName,
          removeAccount,
        }
      : {
          userPrincipalName: userPrincipalName,
          disableAccount: true,
        };

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
    const returnValue: IFormStateUpdate = {
      error: !!error,
      message: error
        ? JSON.stringify(json)
        : `AD: submitted to ${removeAccount ? "delete" : "offboard"}`,
    };
    return returnValue;
  } catch (e) {
    return { error: true, message: (e as any).message } as IFormStateUpdate;
  }
};
