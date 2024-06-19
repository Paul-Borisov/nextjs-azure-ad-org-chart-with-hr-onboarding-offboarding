import { addUsersToDatabase } from "@/prisma/users.create";
import { AuthenticationProvider } from "@/shared/enums/authenticationProvider";
import { Constants } from "@/shared/lib/constants";
import { getAllUsersMockup } from "@/actions/users.get";
import { getAllUsersUncached } from "@/app/api/users/utils";
import {
  getUsersCountFromDatabase,
  getUsersFromDatabase,
} from "@/prisma/users.get";
import { headers } from "next/headers";
import { IHierarchyContext } from "@/components/contexts/iHierarchyContext";
import { IUser } from "@/shared/interfaces/iUser";
import { UserMapper } from "@/shared/mappers/userMapper";
import { ViewType } from "../enums/viewType";

interface IOrgStructureUtils extends IHierarchyContext {
  authenticationProvider?: AuthenticationProvider;
  isAuthenticated: boolean;
  isMockup: boolean;
  shouldUseMockupDataWhenAuthenticated: boolean;
  shouldUseMockupDataWhenUnauthenticated: boolean;
  shouldUseMockupDataWhenAuthenticatedWithGoogle: boolean;
}

const isShowAll = () => {
  const search = headers().get(Constants.headerSearch) as string;
  return /(showall|debug)=(1|true)/i.test(search);
};

export const ensureUsers = async (props: IOrgStructureUtils) => {
  let allUsers: IUser[] | undefined;
  if (!props.isMockup) {
    allUsers = props.cacheUseDatabase
      ? await getUsersFromDatabase()
      : undefined;
    if (!allUsers?.length) {
      // Unexpired users not found in the database, try to retrieve expired ones
      allUsers = props.cacheUseDatabase
        ? await getUsersFromDatabase(undefined, true)
        : undefined;
      if (!allUsers?.length) {
        props.disabledCacheWarning = true;
        // Expired users not found in the database, call the slow sync proc to get them from AAD
        allUsers = await getAllUsersUncached();
        if (allUsers) {
          addUsersToDatabase(allUsers);
        }
      } else {
        // Expired users found in the database, init the async proc to refresh them from AAD
        // and display the expired users in this request
        getAllUsersUncached().then((aadUsers) => {
          getUsersCountFromDatabase(undefined, false).then((usersCount) => {
            if (usersCount) {
              return;
            }
            if (aadUsers) {
              addUsersToDatabase(aadUsers);
            }
          });
        });
      }
    }
    const newUsers = props.cacheUseDatabase
      ? await getUsersFromDatabase(undefined, null, true)
      : undefined;
    if (newUsers?.length) {
      if (isShowAll()) {
        // Show all draft records independently on user existence in Azure AD
        allUsers?.push(...newUsers);
      } else {
        // If active user with the same UPN already exists in Azure AD, do not show its draft record (duplicate)
        const userMap: Set<string> = new Set(
          allUsers?.map((user) => user.userPrincipalName.toLocaleLowerCase())
        );
        newUsers.forEach((user) => {
          if (!userMap.has(user.userPrincipalName.toLocaleLowerCase())) {
            allUsers?.push(user);
          }
        });
      }
    }
  } else {
    allUsers = await getAllUsersMockup();
    if (props.isAuthenticated) {
      // Distinguish displayName for an authenticated user by adding the triple dot to the end.
      allUsers?.forEach((u) => {
        if (u.displayName.endsWith(".")) {
          u.displayName = u.displayName.replace(/\.+$/, "...");
        } else {
          u.displayName += "...";
        }
      });
    }
  }
  if (props.excludeUsers.length) {
    allUsers = allUsers?.filter(
      (u) =>
        !props.excludeUsers.some(
          (e) => !u.userPrincipalName || u.userPrincipalName?.indexOf(e) > -1
        )
    );
  }

  if (allUsers && props.viewType === ViewType.Hierarchy) {
    UserMapper.resolveManagerUpn(allUsers);
  }

  return allUsers;
};
