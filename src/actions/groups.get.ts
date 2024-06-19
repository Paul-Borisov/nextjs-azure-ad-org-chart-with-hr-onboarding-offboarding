"use server";

import { auth } from "@/auth";
import { IGroup } from "@/shared/interfaces/iGroup";
import { GroupMapper } from "@/shared/mappers/groupMapper";

export const getAllGroups = async (
  onPremisesSyncEnabled: boolean | undefined = undefined,
  securityEnabled: boolean | undefined = true
): Promise<IGroup[] | undefined> => {
  const session = await auth();
  if (!session) return undefined;

  //await new Promise((resolve) => setTimeout(() => resolve(true), 3000));
  const allGroups: IGroup[] = [];
  // Required delegated permissions: Group.Read.All (or Directory.Read.All)
  let endpoint =
    "https://graph.microsoft.com/v1.0/groups?$select=id,displayName,groupTypes,onPremisesSyncEnabled,onPremisesSecurityIdentifier";
  if (onPremisesSyncEnabled || securityEnabled) {
    let filter =
      securityEnabled === undefined
        ? ""
        : `securityEnabled eq ${securityEnabled}`;

    filter +=
      onPremisesSyncEnabled === undefined
        ? ""
        : `${filter ? " and " : ""}onPremisesSyncEnabled ${
            onPremisesSyncEnabled ? "eq true" : "ne true"
          }`;
    if (filter) {
      const addCount = onPremisesSyncEnabled === false;
      endpoint += `&$filter=(${filter})${addCount ? "&$count=true" : ""}`;
    }
  }
  while (endpoint) {
    const json = await fetch(endpoint, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${session?.user.accessToken}`,
        consistencyLevel: "eventual",
      },
    })
      .then((r) => r.json())
      .then((json) => json);
    if (json.value) {
      allGroups.push(...GroupMapper.mapGraphGroups(json.value));
    } else if (json.error) {
      console.log(json);
    }
    endpoint = json["@odata.nextLink"];
  }
  return allGroups.sort((a, b) => a.displayName.localeCompare(b.displayName));
};
