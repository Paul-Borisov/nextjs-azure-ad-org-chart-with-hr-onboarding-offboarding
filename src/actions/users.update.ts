"use server";

import { auth } from "@/auth";
import { canManageAzureUsers } from "./users.roles";
import { IBaseAdAccountUpdate } from "@/shared/interfaces/iBaseAdAccountUpdate";
import { IFormStateUpdate } from "@/shared/interfaces/iFormState";

export const updateAzureAdAccount = async (
  account: IBaseAdAccountUpdate
): Promise<IFormStateUpdate> => {
  try {
    const session = await auth();
    if (!(await canManageAzureUsers())) throw Error("403 Access denied");

    let payload: any = { employeeId: account.employeeId };

    const endpoint = `https://graph.microsoft.com/v1.0/users/${account.userPrincipalName}`;
    const json = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${session?.user.accessToken}`,
      },
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (r.ok) {
          return {} as any;
        } else {
          return r.json();
        }
      })
      .then((json) => json);

    const error = json["error"];
    const returnValue: IFormStateUpdate = {
      error: !!error,
      message: error ? JSON.stringify(json) : "EntraID: updated",
      //newUserPrincipalName: !error ? account.userPrincipalName : undefined,
    };
    return returnValue;
  } catch (e) {
    return { error: true, message: (e as any).message } as IFormStateUpdate;
  }
};
