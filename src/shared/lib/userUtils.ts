import { IOrgUnit } from "../interfaces/iOrgUnit";
import { IUser } from "../interfaces/iUser";
import { EnvSettingsClient } from "./envSettingsClient";

export default class UserUtils {
  static extractOrgUnits(users: IUser[] | undefined) {
    const extracted: IOrgUnit[] = [];
    const uniqueOrgUnits = new Set<string>();
    const defaultAttributes = EnvSettingsClient.userLevelDefaultAttributes;

    if (!defaultAttributes?.length) return { extracted, uniqueOrgUnits: [] };

    const unique = new Set<string>();
    users?.forEach((row: IUser) => {
      const orgUnit: string =
        row.onPremisesExtensionAttributes[defaultAttributes[0]];
      if (!orgUnit) return;
      const orgDepartment: string | undefined =
        defaultAttributes.length > 1
          ? row.onPremisesExtensionAttributes[defaultAttributes[1]]
          : undefined;
      const orgTeam: string | undefined =
        defaultAttributes.length > 2
          ? row.onPremisesExtensionAttributes[defaultAttributes[2]]
          : undefined;
      const uniqueKey = `${orgUnit || ""}|${orgDepartment || ""}|${
        orgTeam || ""
      }`.toLocaleLowerCase();
      if (unique.has(uniqueKey)) return;
      unique.add(uniqueKey);
      uniqueOrgUnits.add(orgUnit);
      const entry: IOrgUnit = {
        orgUnit,
        orgDepartment,
        orgTeam,
      };
      extracted.push(entry);
    });
    extracted.sort((a: IOrgUnit, b: IOrgUnit) =>
      a.orgUnit.localeCompare(b.orgUnit)
    );
    return { extracted, uniqueOrgUnits: Array.from(uniqueOrgUnits).toSorted() };
  }

  static getDisplayNameWithTailIndex = (displayName: string, index: number) => {
    return `${displayName.replace(/\(\d+\)$/, "").trim()} (${index})`;
  };
}
