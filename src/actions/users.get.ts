"use server";
import {
  getUserByUserId as getUserByUserIdFromRoute,
  getUserByUserPrincipalName as getUserByUserPrincipalNameFromRoute,
} from "@/app/api/users/utils";

import { IAzureAccount } from "@/shared/interfaces/iAzureAccount";
import { IHybridAccount } from "@/shared/interfaces/iHybridAccount";
import { IUser } from "@/shared/interfaces/iUser";
import { promises as fs } from "fs";

export const getAllUsersMockup = async (): Promise<IUser[] | undefined> => {
  return await fs
    .readFile(process.cwd() + "/public/db/mockup/mockupSanitized.json", "utf8")
    .then((data) => JSON.parse(data) as IUser[]);
};

export const getUserByUserId = async (
  userId: string // id or userPrincipalName
): Promise<IAzureAccount | undefined> => {
  return getUserByUserIdFromRoute(userId);
};

export const getUserByUserPrincipalName = async (
  userPrincipalName: string
): Promise<IHybridAccount | undefined> => {
  return getUserByUserPrincipalNameFromRoute(userPrincipalName);
};
