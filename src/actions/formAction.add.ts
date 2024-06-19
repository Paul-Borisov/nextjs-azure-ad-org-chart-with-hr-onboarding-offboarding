"use server";

import { addNewEmployee as addNewEmployeeSp } from "./sharepoint.create";
import {
  addUserToDatabase,
  removeUserFromDatabase,
} from "@/prisma/users.create";
import { AzureAccountMapper } from "@/shared/mappers/azureAccountMapper";
import { createAzureAccount, ensureUniqueAzureAccount } from "./users.create";
import { createLocalAdAccount } from "./users.createLocal";
import { EnvSettings } from "@/shared/lib/envSettings";
import { FormFields } from "@/shared/enums/formFields";
import { FormStateMapper } from "@/shared/mappers/formStateMapper";
import {
  ensureUniqueDatabaseAccount,
  getUserByUserPrincipalName,
} from "@/prisma/users.get";
import { getValueFromFormData } from "@/shared/lib/formUtils";
import { IAzureAccount } from "@/shared/interfaces/iAzureAccount";
import { IFormState } from "@/shared/interfaces/iFormState";
import { IUser } from "@/shared/interfaces/iUser";
import { revalidatePath } from "next/cache";
import { saveUserPhoto } from "./users.photo";
import Utils from "@/shared/lib/utils";

export const addNewEmployee = async (_: unknown, formData: FormData) => {
  const getValue = (name: string, allowEmpty: boolean = false) =>
    getValueFromFormData(formData, name, allowEmpty);
  const addDataToSharepoint =
    getValue(FormFields.addDataToSharepoint, true) === "on";
  const addToAzure = getValue(FormFields.createAzureAccount, true) === "on";
  const addToLocalAd = getValue(FormFields.createLocalAdAccount, true) === "on";
  const selectedGroups = getValue(FormFields.selectedGroups, true)
    ? getValue(FormFields.selectedGroups, true).split(",")
    : undefined;
  const testCreate = EnvSettings.testCreate;
  const testCreateError = EnvSettings.testCreateError;
  const userPhoto = getValue(FormFields.userPhoto, true);

  let account = AzureAccountMapper.mapFromFormData(formData);
  await ensureUniqueAzureAccount(account);

  //let cachedAccount: IAzureAccount | undefined = undefined;
  const ensureCachedAccount = async () => {
    if (EnvSettings.cacheUseDatabase) {
      // The database may have the record about local AD account, which is being currently provisioned
      // In this case, let's try to ensure the uniqueness of userPrincipalName in these sequential operations
      // The case is specific only to local AD, which has the logic with postponed account provisioning via Azure Automation Hybrid Runbook
      const cachedAccount = JSON.parse(
        JSON.stringify(account)
      ) as IAzureAccount;
      await ensureUniqueDatabaseAccount(cachedAccount);
      if (cachedAccount.userPrincipalName !== account.userPrincipalName) {
        await ensureUniqueAzureAccount(cachedAccount);
        account = cachedAccount;
      }
    }
  };

  const managerUpn = getValue(FormFields.managerUpn);
  if (testCreate || testCreateError) {
    if (!testCreateError) {
      await ensureCachedAccount();
      if (!account.id) account.id = crypto.randomUUID();
      await addNewUserToCache(account, managerUpn);
      if (userPhoto) {
        // Prisma quirks. Refer to comments below.
        setTimeout(() => saveUserPhoto(account, userPhoto, addToAzure), 1000);
      }
    }
    return generateTestResponse(
      addDataToSharepoint,
      addToAzure,
      addToLocalAd,
      testCreateError,
      account
    );
  }

  await ensureCachedAccount();
  const promiseAll: Promise<IFormState>[] = [];
  if (addDataToSharepoint) {
    promiseAll.push(
      addNewEmployeeSp(account, formData, addToAzure || addToLocalAd)
    );
  }
  if (addToAzure) {
    promiseAll.push(createAzureAccount(account, managerUpn, selectedGroups));
  } else if (addToLocalAd) {
    promiseAll.push(
      createLocalAdAccount(account, managerUpn, selectedGroups, userPhoto)
    );
  }

  const results = await Promise.all(promiseAll);
  if (userPhoto) {
    // prisma quirks: what the heck is it doing internally. Caching what and until which moment?
    // It does not seem to respect await at all. Using the macro task helps.
    setTimeout(() => saveUserPhoto(account, userPhoto, addToAzure), 1000);
  }

  const mergedState = FormStateMapper.reduceState(results);

  const returnValue: IFormState = {
    error: mergedState.error,
    listItemId: mergedState.listItemId,
    message: mergedState.message,
    newPassword: mergedState.newPassword,
    newUserPrincipalName: account.userPrincipalName,
  };
  if (!returnValue.error) {
    await addNewUserToCache(account, managerUpn);
  }
  return returnValue;
};

const addNewUserToCache = async (
  account: IAzureAccount,
  managerUpn: string
) => {
  if (!EnvSettings.cacheUseDatabase) return;
  const manager = await getUserByUserPrincipalName(managerUpn);
  const user: IUser = AzureAccountMapper.mapToUser(account, manager);
  user.isDirty = true;
  await addUserToDatabase(user);
};

const generateTestResponse = (
  addDataToSharepoint: boolean,
  addToAzure: boolean,
  addToLocalAd: boolean,
  testCreateError: boolean,
  account: IAzureAccount
) => {
  const listItemId = addDataToSharepoint
    ? Math.ceil(Math.random() * 99999)
    : undefined;
  let message = "";
  if (addDataToSharepoint) {
    message += testCreateError
      ? "TEST MODE ERROR: Duplicate record found"
      : `${listItemId}`;
  }
  if (addToAzure) {
    message += testCreateError
      ? "\nTEST MODE ERROR: Account already exists in Azure AD"
      : `\n${crypto.randomUUID()}`;
  }
  if (addToLocalAd) {
    message += testCreateError
      ? "\nTEST MODE ERROR: Account already exists in local AD"
      : "\nSubmitted";
  }
  const returnValue: IFormState = {
    error: testCreateError,
    listItemId: testCreateError ? undefined : listItemId,
    message: message,
    newPassword: testCreateError ? undefined : Utils.generatePassword(),
    newUserPrincipalName: account.userPrincipalName,
  };
  return returnValue;
};

export const removeFromCache = async (userId: string, pathname: string) => {
  await removeUserFromDatabase(userId);
  revalidatePath(pathname);
};
