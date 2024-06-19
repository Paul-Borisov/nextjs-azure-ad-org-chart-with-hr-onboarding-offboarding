//import { canManageAzureUsers } from "@/actions/users.roles";
//import { canAddListItems, canAddDocuments } from "@/actions/sharepoint.roles";
import { getPermittedUserActions } from "@/actions/aggregated";
import { useEffect, useState } from "react";

export const useCanManageAccounts = (isSharepointEnabled: boolean) => {
  const [canManageAzureAccounts, setCanManageAzureAccounts] = useState(false);
  const [canAddToSharepointList, setAddToSharepointList] = useState(false);
  const [canAddToSharepointLibrary, setAddToSharepointLibrary] =
    useState(false);

  useEffect(() => {
    // Way #1: single aggregated UI-blocking client request. This way provides the best response time.
    getPermittedUserActions().then((results) => {
      setCanManageAzureAccounts(results.canManageAzureAccounts);
      setAddToSharepointList(results.canAddToSharepointList);
      setAddToSharepointLibrary(results.canAddToSharepointLibrary);
    });
    // Way #2: 3 separate non-blocking client requests wrapped into Promise.all
    // const promises: Promise<boolean>[] = [];
    // promises.push(canManageAzureUsers());
    // if (isSharepointEnabled) {
    //   promises.push(canAddListItems());
    //   promises.push(canAddDocuments());
    // }
    // Promise.allSettled(promises).then((values) => {
    //   setCanManageAzureAccounts(!!values[0]);
    //   setAddToSharepointList(!!values[1]);
    //   setAddToSharepointLibrary(!!values[2]);
    // });
    // Way #3: 3 separate non-blocking client requests; the same performance.
    // canManageAzureUsers().then((result) => {
    //   setCanManageAzureAccounts(result);
    // });
    // if (isSharepointEnabled) {
    //   canAddListItems().then((result) => setAddToSharepointList(result));
    //   canAddDocuments().then((result) => setAddToSharepointLibrary(result));
    // }
  }, [isSharepointEnabled]);
  return {
    canManageAzureAccounts,
    canAddToSharepointList,
    canAddToSharepointLibrary,
  };
};
