import { IGroup } from "../interfaces/iGroup";

export class GroupMapper {
  static mapGraphGroups(groups: any[]): IGroup[] {
    return groups
      .filter((group) => !group.groupTypes?.length) // Excludes DynamicMembershop, Unified, etc.
      .map((g: any) => {
        const group: IGroup = {
          id: g.id,
          displayName: g.displayName,
          onPremisesSyncEnabled: !!g.onPremisesSyncEnabled,
        };
        if (group.onPremisesSyncEnabled) {
          group.onPremisesSecurityIdentifier = g.onPremisesSecurityIdentifier;
        }
        return group;
      });
  }
}
