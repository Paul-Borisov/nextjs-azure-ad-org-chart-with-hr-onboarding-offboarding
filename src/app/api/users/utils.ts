import { auth } from "@/auth";
import { AzureAccountMapper } from "@/shared/mappers/azureAccountMapper";
import { EnvSettings } from "@/shared/lib/envSettings";
import { IAzureAccount } from "@/shared/interfaces/iAzureAccount";
import { IHybridAccount } from "@/shared/interfaces/iHybridAccount";
import { IUser } from "@/shared/interfaces/iUser";
import { UserMapper } from "@/shared/mappers/userMapper";

export const getAllUsersUncached = async (): Promise<IUser[] | undefined> => {
  const session = await auth();
  if (!session) return undefined;

  const allUsers: IUser[] = [];
  // Required delegated permissions: User.Read.All
  let endpoint = EnvSettings.azureAdGraphQueryUsers;
  if (!endpoint) {
    endpoint =
      "https://graph.microsoft.com/v1.0/users?$filter=(accountEnabled eq true)&$expand=manager" +
      "&$select=id,userPrincipalName,displayName,employeeId,jobTitle,department,city,country,companyName" +
      ",officeLocation,onPremisesExtensionAttributes";
  }
  //let counter = 0;
  while (endpoint) {
    // counter++;
    // if (counter > 10) break;
    // console.log(counter);

    const json = await fetch(endpoint, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${session?.user.accessToken}`,
      },
    })
      .then((r) => r.json())
      .then((json: any) => json);
    if (json.value) {
      allUsers.push(...UserMapper.mapGraphUsers(json.value));
    } else if (json.error) {
      console.log(json);
    }
    endpoint = json["@odata.nextLink"];
  }
  return allUsers;
};

export const getUserByUserId = async (
  userId: string // id or userPrincipalName
): Promise<IAzureAccount | undefined> => {
  const session = await auth();
  if (!session) return undefined;

  const endpoint = `https://graph.microsoft.com/beta/users/${userId}?$expand=manager`;
  const json: any = await fetch(endpoint, {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${session?.user.accessToken}`,
    },
  }).then(async (r) => await r.json());

  return json.id ? UserMapper.mapGraphUserAccount(json) : undefined;
};

export const getUserByUserPrincipalName = async (
  userPrincipalName: string
): Promise<IHybridAccount | undefined> => {
  const session = await auth();
  if (!session) return undefined;

  const endpoint = `https://graph.microsoft.com/beta/users/${userPrincipalName}`;
  const json: any = await fetch(endpoint, {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${session?.user.accessToken}`,
    },
  }).then(async (r) => await r.json());

  return AzureAccountMapper.mapToHybridAccount(json);
};
