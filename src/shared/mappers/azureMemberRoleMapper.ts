type RoleType = "#microsoft.graph.directoryRole" | "#microsoft.graph.group";
export class AzureMemberRoleMapper {
  static mapMemberRoles(
    data: any,
    roleType: RoleType = "#microsoft.graph.directoryRole"
  ): { [key: string]: string } | undefined {
    if (!Array.isArray(data.value) || !data.value.length) return undefined;
    const results: { [key: string]: string } = {};
    data.value.forEach((entry: any) => {
      if (entry["@odata.type"] === roleType) {
        results[entry.roleTemplateId] = entry.displayName;
      }
    });
    return results;
  }
}
