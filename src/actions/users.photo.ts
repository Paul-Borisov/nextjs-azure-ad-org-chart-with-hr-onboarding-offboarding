"use server";

import { addUserPhotoToDatabase } from "@/prisma/userPhotos.create";
import { auth } from "@/auth";
import { canManageAzureUsers } from "./users.roles";
import { EnvSettings } from "@/shared/lib/envSettings";
//import { fetch, setGlobalDispatcher, Agent, Pool } from "undici";
import { getPhotoUncached as getPhotoUncachedFromRoute } from "@/app/api/photo/[id]/utils";
import { getUserByUserId } from "@/app/api/users/utils";
import { getUserByUserPrincipalName } from "@/prisma/users.get";
import { IAzureAccount } from "@/shared/interfaces/iAzureAccount";

// https://github.com/nodejs/undici/issues/1531, Dear Microsoft :-(
// setGlobalDispatcher(
//   new Agent({ factory: (origin) => new Pool(origin, { connections: 128 }) })
// );

export const getPhotoUncached = async (
  userId: string
): Promise<string | undefined> => {
  // Prefer using the same function hosted in apps/api
  // The matter is Server Actions are primarily designed for mutations.
  // They execute sequentially while routes support parallel executions.
  return getPhotoUncachedFromRoute(userId);
};

export const saveUserPhoto = async (
  account: IAzureAccount,
  userPhotoBase64: string,
  addToAzure: boolean
) => {
  const allErrors: string[] = [];
  if (EnvSettings.cacheUseDatabase) {
    const user = await getUserByUserPrincipalName(account.userPrincipalName);
    if (user?.id) {
      const result = await addUserPhotoToDatabase(
        user.id,
        userPhotoBase64,
        new Date()
      );
      const error = result["error"];
      if (error) {
        allErrors.push(error);
      }
    }
  }
  const arrayBuffer = Buffer.from(userPhotoBase64, "base64");
  if (addToAzure) {
    if (account.id) {
      saveUserPhotoToAzure(account.id, arrayBuffer);
    } else {
      getUserByUserId(account.userPrincipalName).then(async (user) => {
        if (user?.id) {
          await saveUserPhotoToAzure(user.id, arrayBuffer);
        }
      });
    }
  }
};

export const saveUserPhotoToAzure = async (
  userId: string,
  photo: ArrayBuffer
) => {
  const session = await auth();
  if (!session) return undefined;
  if (!(await canManageAzureUsers())) throw Error("403 Access denied");

  const addUserPhoto = async () => {
    const endpoint = `https://graph.microsoft.com/v1.0/users/${userId}/photo/$value`;
    const result = await fetch(endpoint, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "image/jpeg",
      },
      body: photo,
    })
      .then(async (r) => {
        if (r.ok) {
          return {
            error: false,
            message: "User photo added",
          };
        } else {
          return {
            error: true,
            message: await r.text(),
          };
        }
      })
      .then((data) => data);
    return result;
  };

  // Adding user's photo is not guaranteed until the newly created account has been completely provisioned.
  // The complete provisioning usually takes 30-60 seconds.
  const maxAttempts = 10;
  const retryIntervalInSeconds = 10;
  let failedAttempts = 0;
  const postponed = (seconds: number) =>
    setTimeout(async () => {
      if (failedAttempts < maxAttempts) {
        console.log(`Attempt ${failedAttempts + 1}`);
        addUserPhoto().then((result) => {
          if (result.error) {
            failedAttempts++;
            if (failedAttempts <= maxAttempts) {
              console.log(` failed, will retry in 10s`);
              postponed(retryIntervalInSeconds);
            } else {
              postponed(0);
            }
          } else {
            console.log("User's photo was updated successfully");
          }
        });
      } else {
        console.log(`${failedAttempts} attempts did not succeed, stopped`);
      }
    }, seconds * 1000);
  console.log("Initiating postponed update of user's photo...");
  postponed(retryIntervalInSeconds);
};
