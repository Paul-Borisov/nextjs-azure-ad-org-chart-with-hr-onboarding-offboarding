"use server";

import { addGroupMember } from "./groups.update";
import { auth } from "@/auth";
import { AzureAccountMapper } from "@/shared/mappers/azureAccountMapper";
import { canManageAzureUsers } from "./users.roles";
import { EnvSettings } from "@/shared/lib/envSettings";
import { FormStateMapper } from "@/shared/mappers/formStateMapper";
import { IAzureAccount } from "@/shared/interfaces/iAzureAccount";
import { IFormState } from "@/shared/interfaces/iFormState";
import { getUserByUserId } from "@/app/api/users/utils";
import UserUtils from "@/shared/lib/userUtils";
import Utils from "@/shared/lib/utils";

export const ensureUniqueAzureAccount = async (account: IAzureAccount) => {
  let index = 1;
  let uniqueUserPrincipalName = account.userPrincipalName;
  // Non-blocking retry instead of while(true)
  for (let i = 0; i < 100; i++) {
    const existingUser = await getUserByUserId(uniqueUserPrincipalName);
    if (!existingUser) {
      if (index > 1) {
        account.userPrincipalName = uniqueUserPrincipalName;
        account.mail = uniqueUserPrincipalName;
        account.displayName = UserUtils.getDisplayNameWithTailIndex(
          account.displayName,
          index
        );
      }
      break;
    } else {
      uniqueUserPrincipalName = account.userPrincipalName.replace(
        /(\d+)?@/,
        `${++index}@`
      );
    }
  }
};

const addUserToGroups = async (
  userId: string,
  selectedGroups: string[] | undefined
): Promise<IFormState | undefined> => {
  if (!selectedGroups?.length) return;
  const allGroups: Promise<IFormState | undefined>[] = [];
  selectedGroups.forEach((groupId) => {
    allGroups.push(addGroupMember(groupId, userId));
  });
  const results = await Promise.all(allGroups);
  return FormStateMapper.reduceState(results);
};

export const createAzureAccount = async (
  account: IAzureAccount,
  managerUpn: string,
  selectedGroups: string[] | undefined
) => {
  try {
    const session = await auth();
    if (!(await canManageAzureUsers())) throw Error("403 Access denied");

    const password = Utils.generatePassword();
    // Required delegated permissions: User.ReadWrite.All
    const endpoint = "https://graph.microsoft.com/v1.0/users";
    let payload = {
      accountEnabled: !EnvSettings.disableNewAccountWhenCreated,
      displayName: account.displayName,
      mailNickname: account.userPrincipalName.replace(/@.+/, ""),
      userPrincipalName: account.userPrincipalName,
      passwordProfile: {
        forceChangePasswordNextSignIn: true,
        password,
      },
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

    const error: any = json["error"];
    const userId: string = json.id;
    let membershipResults: IFormState | undefined = undefined;
    if (!error && userId) {
      account.id = userId;
      type AccountAttributes = Partial<IAzureAccount>;
      const updateAdditionalAttributes = async (payload: AccountAttributes) => {
        await fetch(`${endpoint}/${userId}`, {
          method: "PATCH",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            authorization: `Bearer ${session?.user.accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      };
      let payloadForUpdate: AccountAttributes = {
        employeeId: account.employeeId ? account.employeeId : undefined,
        givenName: account.givenName,
        surname: account.surname,
        jobTitle: account.jobTitle ? account.jobTitle : undefined,
        mail: account.userPrincipalName,
        mobilePhone: account.mobilePhone ? account.mobilePhone : undefined,
        businessPhones: account.businessPhones?.filter((phone) => !!phone),
        //imAddresses: [account.userPrincipalName],
      };
      updateAdditionalAttributes(payloadForUpdate);

      if (managerUpn) {
        const manager = await getUserByUserId(managerUpn);
        if (manager) {
          payloadForUpdate = {};
          payloadForUpdate.city = manager.city;
          payloadForUpdate.companyName = manager.companyName;
          payloadForUpdate.country = manager.country;
          payloadForUpdate.department = manager.department;
          payloadForUpdate.officeLocation = manager.officeLocation;
          payloadForUpdate.postalCode = manager.postalCode;
          payloadForUpdate.state = manager.state;
          payloadForUpdate.streetAddress = manager.streetAddress;
          payloadForUpdate.usageLocation = payload.userPrincipalName
            .substring(payload.userPrincipalName.lastIndexOf(".") + 1)
            .toUpperCase();
          if (
            !payloadForUpdate.usageLocation ||
            payloadForUpdate.usageLocation.length > 2
          ) {
            payloadForUpdate.usageLocation = manager.usageLocation;
          }
          AzureAccountMapper.copyExtensionAttributesFromManager(
            manager,
            payloadForUpdate
          );
          AzureAccountMapper.mergeExtensionAttributesFromAccount(
            account,
            payloadForUpdate
          );
        }
        updateAdditionalAttributes(payloadForUpdate);
      }

      if (account.manager) {
        await fetch(`${endpoint}/${userId}/manager/$ref`, {
          method: "PUT",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            authorization: `Bearer ${session?.user.accessToken}`,
          },
          body: JSON.stringify(account.manager),
        });
      }
      membershipResults = await addUserToGroups(userId, selectedGroups);
    }
    const state: IFormState = {
      error: !!error || !userId,
      message: error
        ? JSON.stringify(json)
        : !userId
        ? "Undetermined error"
        : userId,
      newPassword: !error && userId ? password : undefined,
    };
    return FormStateMapper.reduceState([state, membershipResults]);
  } catch (e) {
    return { error: true, message: (e as any).message } as IFormState;
  }
};
