import { IEmployeeIdAndListItem } from "@/shared/interfaces/iEmployeeIdAndListItemId";
import { IAzureAccount } from "../interfaces/iAzureAccount";
import { SharepointFields } from "../enums/sharepointFields";
import { IOrgUnit } from "../interfaces/iOrgUnit";

export class SharepointMapper {
  static extractEmployeeIds(data: any): string[] {
    return data.value.map((row: any) => row.Title);
  }

  static extractEmployeeProperties(
    userPrincipalName: string,
    userRecord: any
  ): IAzureAccount | undefined {
    const extracted: IAzureAccount[] = userRecord?.value.map((row: any) => {
      const account: IAzureAccount = {
        userPrincipalName,
        employeeId: row[SharepointFields.employeeId],
        givenName: row[SharepointFields.firstName],
        surname: row[SharepointFields.lastName],
        displayName: row[SharepointFields.displayName],
        jobTitle: row[SharepointFields.jobTitle],
        mobilePhone: row[SharepointFields.mobilePhone],
        businessPhones: row[SharepointFields.workPhone]
          ? [row[SharepointFields.workPhone]]
          : [],
      };
      return account;
    });
    return extracted?.length ? extracted[0] : undefined;
  }

  static extractEmployeeIdandListItemId(
    data: any
  ): IEmployeeIdAndListItem | undefined {
    const extracted = data?.value.map((row: any) => ({
      employeeId: row.Title,
      listItemId: row.Id,
    }));
    return extracted?.length ? extracted[0] : undefined;
  }

  static extractUserId(data: any): string | undefined {
    if (!Array.isArray(data.value) || !data.value.length) return undefined;
    return data.value[data.value.length - 1].Id;
  }
  static extractFirstListItem(data: any): any {
    if (!Array.isArray(data.value) || !data.value.length) return undefined;
    return data.value[0];
  }

  static extractAllErrorsForSystemUpdateResults = (
    results: any
  ): string[] | undefined => {
    if (Array.isArray(results.value)) {
      const errors = (results.value as any[])
        .map(
          (fieldResults: any) =>
            (fieldResults.HasException
              ? fieldResults.ErrorMessage
              : undefined) as string
        )
        .filter((entry: any) => !!entry);
      return errors.length ? errors : undefined;
    } else {
      const standardError =
        typeof results === "object"
          ? this.extractStandardError(results)
          : undefined;
      return standardError ? [standardError as string] : undefined;
    }
  };

  static extractStandardError = (result: any): string | undefined => {
    const error = result?.["odata.error"];
    return error ? error.message?.value : undefined;
  };

  static extractOrgUnits(data: any) {
    const unique = new Set();
    const extracted: IOrgUnit[] | undefined = data?.value
      ?.map((row: any) => {
        const orgUnit: string = row[SharepointFields.orgUnit];
        if (!orgUnit) return undefined;
        const orgDepartment: string = row[SharepointFields.orgDepartment];
        const orgTeam: string = row[SharepointFields.orgTeam];
        const key = `${orgUnit || ""}|${orgDepartment || ""}|${
          orgTeam || ""
        }`.toLocaleLowerCase();
        if (unique.has(key)) return undefined;
        unique.add(key);
        const entry: IOrgUnit = {
          orgUnit,
          orgDepartment,
          orgTeam,
        };
        return entry;
      })
      .filter((entry: IOrgUnit) => !!entry?.orgUnit)
      .sort((a: IOrgUnit, b: IOrgUnit) => a.orgUnit.localeCompare(b.orgUnit));
    return extracted?.length ? extracted : undefined;
  }
}
