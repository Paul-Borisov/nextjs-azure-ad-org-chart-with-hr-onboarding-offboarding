import { IDropdownOption } from "@fluentui/react";
import { EnvSettingsClient } from "@/shared/lib/envSettingsClient";
import { getAllGroups } from "@/actions/groups.get";
import { IGroup } from "@/shared/interfaces/iGroup";
import { useEffect, useState } from "react";

export const useAzureGroups = (props: {
  addToAzure: boolean;
  addToLocalAd: boolean;
}) => {
  const [groups, setGroups] = useState<IGroup[]>();

  const prospectedGroups: string[] = [];
  if (props.addToLocalAd) {
    prospectedGroups.push(...EnvSettingsClient.newUserGroupsLocalAd);
  } else if (props.addToAzure) {
    prospectedGroups.push(...EnvSettingsClient.newUserGroupsAzureAd);
  }

  useEffect(() => {
    if (![props.addToAzure, props.addToLocalAd].some((p) => p)) {
      if (groups) setGroups(undefined);
      return;
    }
    const onPremisesSyncEnabled = props.addToLocalAd
      ? true
      : props.addToAzure
      ? false
      : undefined;
    const securityEnabled = true;
    setGroups(undefined);
    getAllGroups(onPremisesSyncEnabled, securityEnabled).then((allGroups) => {
      if (props.addToLocalAd && allGroups?.length && prospectedGroups.length) {
        const newUserGroups = prospectedGroups;
        const missingGroups: IGroup[] = [];
        newUserGroups?.forEach((localGroupName) => {
          const name = localGroupName.trim();
          const nameToSearchFor = name.toLocaleLowerCase();
          const found = allGroups?.some(
            (adGroup) =>
              adGroup.displayName.toLocaleLowerCase() === nameToSearchFor
          );
          const found2 = allGroups?.find(
            (adGroup) =>
              adGroup.displayName.toLocaleLowerCase() === nameToSearchFor
          );

          if (found) return;
          missingGroups.push({
            id: crypto.randomUUID(), // This is not used in the logic for addToLocalAd
            displayName: name, // Thus us used instead
            onPremisesSyncEnabled: false,
            onPremisesSecurityIdentifier: undefined,
          });
        });
        if (missingGroups.length) {
          allGroups?.push(...missingGroups);
          allGroups?.sort((a, b) =>
            a.displayName
              .toLocaleLowerCase()
              .localeCompare(b.displayName.toLocaleLowerCase())
          );
        }
      }
      setGroups(allGroups);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.addToAzure, props.addToLocalAd]);

  const options = groups?.map(
    (group) =>
      ({
        key: props.addToLocalAd
          ? group.onPremisesSecurityIdentifier
            ? group.onPremisesSecurityIdentifier
            : group.displayName
          : group.id,
        text: group.displayName,
        data: group,
        title: group.displayName,
        selected: prospectedGroups.some(
          (defaultGroup) =>
            defaultGroup.toLocaleLowerCase().trim() ===
            group.displayName.toLocaleLowerCase()
        ),
      } as IDropdownOption)
  );

  return { options };
};
