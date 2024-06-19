"use server";

import { auth } from "@/auth";
import { EnvSettings } from "@/shared/lib/envSettings";
import { IBaseAdAccountUpdate } from "@/shared/interfaces/iBaseAdAccountUpdate";
import { IFormStateUpdate } from "@/shared/interfaces/iFormState";
import { canManageAzureUsers } from "./users.roles";

export const updateLocalAdAccount = async (account: IBaseAdAccountUpdate) => {
  try {
    const session = await auth();
    if (!(await canManageAzureUsers())) throw Error("403 Access denied");

    const endpoint = EnvSettings.azureAutomationWebhookUpdateLocalAdUser;
    let payload = { ...account };

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
      message: error ? JSON.stringify(json) : "Local AD: submitted",
      //newUserPrincipalName: !error ? account.userPrincipalName : undefined,
    };
    return returnValue;
  } catch (e) {
    return { error: true, message: (e as any).message } as IFormStateUpdate;
  }
};
