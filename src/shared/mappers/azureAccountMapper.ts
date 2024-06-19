import { Constants } from "../lib/constants";
import { EnvSettingsClient } from "../lib/envSettingsClient";
import { FormFields } from "../enums/formFields";
import { getValueFromFormData } from "@/shared/lib/formUtils";
import { IAzureAccount } from "../interfaces/iAzureAccount";
import { IHybridAccount } from "../interfaces/iHybridAccount";
import { IUser } from "../interfaces/iUser";
import latinize from "latinize";

const extensionAttributeNumbersToMergeFromAccount = [2, 10, 11, 12];
const extensionAttributeNumbersToCopyFromManager = [
  2,
  3,
  5,
  ...extensionAttributeNumbersToMergeFromAccount,
];

export class AzureAccountMapper {
  static copyExtensionAttributesFromManager = (
    manager: IUser | IAzureAccount,
    targetObject: any
  ) => {
    extensionAttributeNumbersToCopyFromManager.forEach((id) => {
      const value =
        manager.onPremisesExtensionAttributes?.[
          `${Constants.extensionAttribute}${id}`
        ];
      if (!value) return;
      targetObject.onPremisesExtensionAttributes =
        targetObject.onPremisesExtensionAttributes || {};
      targetObject.onPremisesExtensionAttributes[
        `${Constants.extensionAttribute}${id}`
      ] = value;
    });
  };

  // After extensionAtributes have been copied from manager, check if formData contains individual org.level attributes
  // to be set explicitly (overwrite manager's copies).
  static mergeExtensionAttributesFromAccount = (
    account: IUser | IAzureAccount,
    targetObject: any
  ) => {
    const notEmpty = extensionAttributeNumbersToMergeFromAccount.some(
      (id) =>
        !!account.onPremisesExtensionAttributes?.[
          `${Constants.extensionAttribute}${id}`
        ]
    );
    if (!notEmpty) return;
    extensionAttributeNumbersToMergeFromAccount.forEach((id) => {
      const value =
        account.onPremisesExtensionAttributes?.[
          `${Constants.extensionAttribute}${id}`
        ];
      targetObject.onPremisesExtensionAttributes =
        targetObject.onPremisesExtensionAttributes || {};
      targetObject.onPremisesExtensionAttributes[
        `${Constants.extensionAttribute}${id}`
      ] = value;
    });
  };

  static mapFromFormData(formData: FormData) {
    const getValue = (name: string, allowEmpty: boolean = false) =>
      getValueFromFormData(formData, name, allowEmpty);

    const employeeId = getValue(FormFields.employeeId, true);
    const firstName = getValue(FormFields.firstName);
    const lastName = getValue(FormFields.lastName);
    let displayName = getValue(FormFields.displayName, true);
    if (!displayName) displayName = `${firstName ?? ""} ${lastName ?? ""}`;
    const jobTitle = getValue(FormFields.jobTitle, true);
    const managerUpn = getValue(FormFields.managerUpn);
    // https://learn.microsoft.com/en-us/microsoft-365/enterprise/prepare-for-directory-synchronization?view=o365-worldwide
    // Additionally, let's avoid using allowed but odd looking chars like '!#^~
    const userPrincipalName =
      latinize(`${firstName ?? ""}.${lastName ?? ""}`)
        .replace(/\s/g, ".")
        .replace(/[^A-Za-z0-9-\_\.]/g, "")
        .toLowerCase() + managerUpn.substring(managerUpn.lastIndexOf("@"));

    const mobilePhone = getValue(FormFields.mobilePhone, true);
    const workPhone = getValue(FormFields.workPhone, true);
    const orgUnit = getValue(FormFields.orgUnit, true);
    const orgDepartment = getValue(FormFields.orgDepartment, true);
    const orgTeam = getValue(FormFields.orgTeam, true);

    const account: IAzureAccount = {
      employeeId,
      givenName: firstName,
      surname: lastName,
      displayName,
      jobTitle,
      userPrincipalName,
      manager: {
        "@odata.id": `https://graph.microsoft.com/v1.0/users/${managerUpn}`,
      },
      mobilePhone,
      businessPhones: workPhone ? [workPhone] : [],
    };
    const defaultAttributes = EnvSettingsClient.userLevelDefaultAttributes;
    if (defaultAttributes?.length) {
      const applyEnvPropertyAttribute = (
        envPropertyNameOrder: number, // 0-based
        propertyValue: string
      ) => {
        if (defaultAttributes?.length > envPropertyNameOrder) {
          const envPropertyName = defaultAttributes[envPropertyNameOrder];
          if (envPropertyName.startsWith(Constants.extensionAttribute)) {
            account.onPremisesExtensionAttributes =
              account.onPremisesExtensionAttributes || {};
            account.onPremisesExtensionAttributes[envPropertyName] =
              propertyValue;
          } else {
            (account as any)[envPropertyName] = propertyValue;
          }
        }
      };
      const notEmpty = !!orgUnit || !!orgDepartment || !!orgTeam;
      if (notEmpty) {
        applyEnvPropertyAttribute(0, orgUnit);
        applyEnvPropertyAttribute(1, orgDepartment);
        applyEnvPropertyAttribute(2, orgTeam);
      }
    }

    return account;
  }

  static mapToHybridAccount(json: any): IHybridAccount | undefined {
    const user: IHybridAccount | undefined = json?.id
      ? {
          id: json.id,
          onPremisesSyncEnabled: !!json.onPremisesSyncEnabled,
          userPrincipalName: json.userPrincipalName,
        }
      : undefined;
    return user;
  }

  static mapFromUser(user: IUser) {
    const account: IAzureAccount = {
      displayName: user.displayName,
      jobTitle: user.jobTitle,
      givenName: user.displayName
        .substring(0, user.displayName.indexOf(" "))
        .trim(),
      manager: user.managerUpn
        ? {
            "@odata.id": `https://graph.microsoft.com/v1.0/users/${user.managerUpn}`,
          }
        : undefined,
      surname: user.displayName
        .substring(user.displayName.indexOf(" ") + 1)
        .trim(),
      userPrincipalName: user.userPrincipalName,
      onPremisesExtensionAttributes: user.onPremisesExtensionAttributes,
      //mobilePhone,
      //businessPhones
    };
    return account;
  }

  static mapToUser(account: IAzureAccount, manager?: IUser) {
    const user: IUser = {
      id: account.id ?? crypto.randomUUID(),
      userPrincipalName: account.userPrincipalName,
      displayName: account.displayName,
      jobTitle: account.jobTitle as string,
      officeLocation: account.officeLocation as string,
      onPremisesExtensionAttributes: {},
    };
    if (manager) {
      user.manager = manager.displayName;
      user.managerUpn = manager.userPrincipalName;
    }
    if (account.department || manager?.department) {
      user.department = account.department || manager?.department;
    }
    if (account.city || manager?.city) {
      user.city = account.city || manager?.city;
    }
    if (account.country || manager?.country) {
      user.country = account.country || manager?.country;
    }
    if (account.companyName || manager?.companyName) {
      user.companyName = account.companyName || manager?.companyName;
    }
    if (account.officeLocation || manager?.officeLocation) {
      user.officeLocation = (account.officeLocation ||
        manager?.officeLocation) as string;
    }
    if (account.onPremisesExtensionAttributes) {
      user.onPremisesExtensionAttributes =
        account.onPremisesExtensionAttributes;
    } else if (manager?.onPremisesExtensionAttributes) {
      this.copyExtensionAttributesFromManager(manager, user);
      this.mergeExtensionAttributesFromAccount(account, user);
    }
    return user;
  }
}
