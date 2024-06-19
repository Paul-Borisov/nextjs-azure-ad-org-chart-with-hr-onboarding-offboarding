"use server";

import { auth } from "@/auth";
import { canManageAzureUsers } from "./users.roles";
import { FormStateMapper } from "@/shared/mappers/formStateMapper";
import { IFormStateUpdate } from "@/shared/interfaces/iFormState";
import { IHybridAccount } from "@/shared/interfaces/iHybridAccount";
import { removeUserFromAllGroups } from "./groups.update";
import Utils from "@/shared/lib/utils";

export const offboardAzureAdAccount = async (user: IHybridAccount) => {
  try {
    const canManage = await canManageAzureUsers();
    if (!canManage || !user) {
      return { error: false, message: "" }; // No access, skip this update
    }

    const password = Utils.generatePassword();
    let payload: any = {
      accountEnabled: false,
      passwordProfile: {
        forceChangePasswordNextSignIn: false,
        password,
      },
      // The following property seems to be updatable even for AD Connect-synced accounts.
      // Saving date of account's disabling here in the format yyyy-MM-dd.
      // preferredDataLocation: new Intl.DateTimeFormat("fr-CA", {
      //   year: "numeric",
      //   month: "2-digit",
      //   day: "2-digit",
      // }).format(new Date()),
    };

    const session = await auth();
    const endpoint = `https://graph.microsoft.com/v1.0/users/${user.id}`;
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
    const returnValue1: IFormStateUpdate = {
      error: !!error,
      message: error ? JSON.stringify(json) : "AAD: offboarded",
    };

    const returnValue2: IFormStateUpdate = await removeUserFromAllGroups(
      user.id
    );
    // Removal from synced AD groups may fail, ignore this error (willbe removed from local AD anyway)
    const groupRemovalResults =
      returnValue2.error && user.onPremisesSyncEnabled
        ? undefined
        : returnValue2;
    return FormStateMapper.reduceStateUpdate([
      returnValue1,
      groupRemovalResults,
    ]);
  } catch (e) {
    return { error: true, message: (e as any).message } as IFormStateUpdate;
  }
};

export const deleteAzureAdAccount = async (user: IHybridAccount) => {
  try {
    const canManage = await canManageAzureUsers();
    if (!canManage || !user) {
      return { error: false, message: "" }; // No access, skip this update
    }

    const session = await auth();
    const endpoint = `https://graph.microsoft.com/v1.0/users/${user.id}`;
    const json = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${session?.user.accessToken}`,
      },
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
      message: error ? JSON.stringify(json) : "AAD: deleted",
    };

    return returnValue;
  } catch (e) {
    return { error: true, message: (e as any).message } as IFormStateUpdate;
  }
};
