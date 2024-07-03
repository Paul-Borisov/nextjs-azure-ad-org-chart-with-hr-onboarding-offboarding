"use server";

import { auth } from "@/auth";
import { canManageAzureUsers } from "./users.roles";
import { IFormState, IFormStateUpdate } from "@/shared/interfaces/iFormState";
import { FormStateMapper } from "@/shared/mappers/formStateMapper";
import { GroupMapper } from "@/shared/mappers/groupMapper";

export const addGroupMember = async (groupId: string, userId: string) => {
  const session = await auth();
  if (!session) return undefined;
  if (!(await canManageAzureUsers())) throw Error("403 Access denied");

  // Required delegated permissions: Group.ReadWrite.All
  // https://learn.microsoft.com/en-us/graph/api/group-post-members?view=graph-rest-1.0&tabs=http
  let endpoint = `https://graph.microsoft.com/v1.0/groups/${groupId}/members/$ref`;
  const payload = {
    "@odata.id": `https://graph.microsoft.com/v1.0/directoryObjects/${userId}`,
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
    .then((r) => {
      if (r.ok) {
        return { message: `user ${userId} added to group ${groupId}` };
      } else {
        return r.json();
      }
    })
    .then((json) => json);

  const error: any = json["error"];
  const returnValue: IFormState = {
    error: !!error,
    message: error ? JSON.stringify(json) : json.message || "OK",
  };
  return returnValue;
};

export const removeUserFromAllGroups = async (userId: string) => {
  const session = await auth();
  if (!session) {
    return { error: true, message: "Not authenticated" } as IFormStateUpdate;
  }
  if (!(await canManageAzureUsers())) throw Error("403 Access denied");

  // Required delegated permissions: Group.ReadWrite.All
  // https://learn.microsoft.com/en-us/graph/api/group-post-members?view=graph-rest-1.0&tabs=http
  const endpoint = `https://graph.microsoft.com/v1.0/users/${userId}/memberOf`;
  const json = await fetch(endpoint, {
    method: "GET",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${session?.user.accessToken}`,
    },
  }).then((r) => r.json());

  const error: any = json["error"];
  if (error) {
    return {
      error: true,
      message: JSON.stringify(json),
    } as IFormStateUpdate;
  }

  const promises: Promise<IFormStateUpdate>[] = [];
  GroupMapper.mapGraphGroups(json.value).forEach((group) => {
    const endpointDelete = `https://graph.microsoft.com/v1.0/groups/${group.id}/members/${userId}/$ref`;
    promises.push(
      fetch(endpointDelete, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${session?.user.accessToken}`,
        },
      }).then(async (r) => {
        if (r.ok) {
          return { error: false, message: `${group.displayName}: removed` };
        } else {
          return {
            error: true,
            message: await r.json().then((json) => JSON.stringify(json)),
          };
        }
      })
    );
  });

  if (promises.length) {
    return await Promise.all(promises).then((results) =>
      FormStateMapper.reduceStateUpdate(results)
    );
  } else {
    // User groups not found (already removed from them?)
    return { error: false, message: "" } as IFormStateUpdate;
  }
};
