import { EnvSettings } from "@/shared/lib/envSettings";
import { FormFields } from "@/shared/enums/formFields";
import { IAzureAccount } from "@/shared/interfaces/iAzureAccount";
import { IUser } from "@/shared/interfaces/iUser";
import prisma from "@/prisma/clientSingleton";
import UserUtils from "@/shared/lib/userUtils";

export const getMaxCacheTimestamp = () => {
  const cacheExpirationTime = new Date();
  cacheExpirationTime.setSeconds(
    cacheExpirationTime.getSeconds() - EnvSettings.cacheTimeoutInSeconds
  );
  return cacheExpirationTime;
};

export const ensureUniqueDatabaseAccount = async (account: IAzureAccount) => {
  let index = 1;
  let uniqueUserPrincipalName = account.userPrincipalName;
  // Non-blocking retry instead of while(true)
  for (let i = 0; i < 100; i++) {
    const user = await getUserByUserPrincipalName(uniqueUserPrincipalName);
    if (!user) {
      account.userPrincipalName = uniqueUserPrincipalName;
      account.mail = uniqueUserPrincipalName;
      break;
    }
    uniqueUserPrincipalName = account.userPrincipalName.replace(
      /(\d+)?@/,
      `${++index}@`
    );
  }
  //index = 1;
  let uniqueDisplayName = account.displayName;
  // Non-blocking retry instead of while(true)
  for (let i = 0; i < 100; i++) {
    const user = await getUserByDisplayName(uniqueDisplayName);
    if (!user) {
      account.displayName = uniqueDisplayName;
      break;
    }
    uniqueDisplayName = UserUtils.getDisplayNameWithTailIndex(
      account.displayName,
      index
    );
  }
};

export const getUserByDisplayName = async (displayName: string) => {
  return getUserByAttribute(FormFields.displayName, displayName);
};
export const getUserByUserPrincipalName = async (userPrincipalName: string) => {
  return getUserByAttribute(FormFields.userPrincipalName, userPrincipalName);
};

export const getUserByAttribute = async (
  attributeName: string,
  attributeValue: string
) => {
  const user = prisma.users
    .findFirst({
      where: {
        properties: {
          contains: `"${attributeName}":"${attributeValue}"`,
        },
      },
    })
    .then(async (dbUser) => {
      if (dbUser) {
        const user: IUser = JSON.parse(dbUser.properties);
        user.id = dbUser.id;
        return user;
      } else {
        return undefined;
      }
    })
    .catch(async (e) => {
      console.log(e);
      return undefined;
    });
  //.finally(async () => await prisma.$disconnect());

  return user;
};

export const getUsersFromDatabase = async (
  modified: Date = getMaxCacheTimestamp(),
  expired: boolean | null = false, // null => both
  isNew: boolean = false
) => {
  const users = prisma.users
    .findMany(getWhereFilter(modified, expired, isNew))
    .then(async (data) => {
      return data
        .map((dbUser) => {
          try {
            const user: IUser = JSON.parse(dbUser.properties);
            user.id = dbUser.id;
            return user;
          } catch (e) {
            return {} as IUser;
          }
        })
        .filter((u) => u.id);
    })
    .catch(async (e) => {
      console.log(e);
      return undefined;
    });
  //.finally(async () => await prisma.$disconnect());

  return users;
};

export const getUsersCountFromDatabase = async (
  modified: Date = getMaxCacheTimestamp(),
  expired: boolean | null = false,
  isNew: boolean = false
) => {
  const usersCount = prisma.users
    .count(getWhereFilter(modified, expired, isNew))
    .then((data) => data)
    .catch(async (e) => {
      console.log(e);
      return undefined;
    });
  //.finally(async () => await prisma.$disconnect());

  return usersCount;
};

const getWhereFilter = (
  modified: Date,
  expired: boolean | null,
  isNew: boolean
) => {
  return {
    where: {
      modified:
        expired === false
          ? {
              gt: modified,
            }
          : expired === true
          ? {
              lte: modified,
            }
          : { gt: new Date(1900, 0, 1) },
      isNew: isNew,
    },
  };
};
