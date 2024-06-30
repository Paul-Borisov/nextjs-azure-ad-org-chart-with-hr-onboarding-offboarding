import { Constants } from "../lib/constants";
import { EnvSettingsClient } from "../lib/envSettingsClient";
import { IAzureAccount } from "../interfaces/iAzureAccount";
import { IUser } from "../interfaces/iUser";
import { IUserLevel } from "../interfaces/iUserLevel";
import Utils from "../lib/utils";

export class UserMapper {
  static getUserLevels(
    users: IUser[],
    levelProperties?: string[]
  ): IUserLevel[] {
    return users.map((u) => {
      if (levelProperties?.length) {
        const user: IUserLevel = { ...u };
        user.level1 = undefined;
        user.level2 = undefined;
        user.level3 = undefined;
        user.level4 = undefined;
        user.level5 = undefined;
        levelProperties.forEach((propertyNameOrPath, index) => {
          const levelProperty: string = `level${index + 1}`;
          try {
            //@ts-ignore
            user[levelProperty] = eval(`user.${propertyNameOrPath}`);
            //Another TS-satisfying solution (looks a bit odd but works)
            //let user = ...
            //user = {...user, ...{[levelProperty]: eval(`user.${propertyNameOrPath}`)}}
            //One more TS-satisfying solution
            //function setProperty<Type, Key extends keyof Type>(obj: Type, key: Key, value: any) {obj[key] = value;}
            //setProperty(user, levelProperty as keyof typeof user, eval(`user.${propertyNameOrPath}`))
          } catch (e) {
            console.error(e);
          }
        });
        return user;
      }
      const user: IUserLevel = {
        ...u,
        level1: u.onPremisesExtensionAttributes.extensionAttribute10,
        level2: u.onPremisesExtensionAttributes.extensionAttribute11,
        level3: u.onPremisesExtensionAttributes.extensionAttribute12,
        level4: undefined,
        level5: undefined,
      };
      // If .env > NEXT_PUBLIC_USER_LEVEL_DEFAULT_ATTRIBUTES is present, try using its values
      EnvSettingsClient.userLevelDefaultAttributes?.forEach((attr, index) => {
        if (!attr || index > 5) return;
        if (attr.startsWith(Constants.extensionAttribute)) {
          attr = `onPremisesExtensionAttributes.${attr}`;
        }
        (user[`level${index + 1}` as keyof IUserLevel] as string) = eval(
          `u.${attr}`
        );
      });
      /*
      // Two-level structure by company name + position
      const user: IUserLevel = {
        ...u,
        level1: u.companyName,
        level2: u.jobTitle,
      };

      // Three-level structure by org.unit + department + team
      const user: IUserLevel = {
        ...u,
        level1: u.onPremisesExtensionAttributes.extensionAttribute10,
        level2: u.onPremisesExtensionAttributes.extensionAttribute11,
        level3: u.onPremisesExtensionAttributes.extensionAttribute12,

      // Four-level structure by org.unit + companyName + department + team
      const user: IUserLevel = {
        ...u,
        level1: u.onPremisesExtensionAttributes.extensionAttribute10,
        level2: u.companyName,
        level3: u.onPremisesExtensionAttributes.extensionAttribute11,
        level4: u.onPremisesExtensionAttributes.extensionAttribute12,

      // Five-level structure by company name + position + org.unit + department + team
      const user: IUserLevel = {
        ...u,
        level1: u.companyName,
        level2: u.jobTitle,
        level3: u.onPremisesExtensionAttributes.extensionAttribute10,
        level4: u.onPremisesExtensionAttributes.extensionAttribute11,
        level5: u.onPremisesExtensionAttributes.extensionAttribute12,
      };
      */
      return user;
    });
  }

  static mapGraphUserAccount(account: any): IAzureAccount | undefined {
    const azureAccount: IAzureAccount = {
      businessPhones: account.businessPhones,
      city: account.city,
      companyName: account.companyName,
      country: account.country,
      department: account.department,
      displayName: account.displayName,
      employeeId: account.employeeId,
      givenName: account.givenName,
      imAddresses: account.imAddresses,
      jobTitle: account.jobTitle,
      mail: account.mail,
      manager: account.manager?.userPrincipalName,
      mobilePhone: account.mobilePhone,
      officeLocation: account.officeLocation,
      onPremisesExtensionAttributes: Utils.getValuable(
        account.onPremisesExtensionAttributes
      ),
      postalCode: account.postalCode,
      proxyAddresses: account.proxyAddresses,
      state: account.state,
      streetAddress: account.streetAddress,
      surname: account.surname,
      usageLocation: account.usageLocation,
      userPrincipalName: account.userPrincipalName,
    };
    return azureAccount;
  }

  static mapGraphUsers(users: any[]): IUser[] {
    return users
      .filter((u: any) => /^\d{5}$/.test(u.employeeId))
      .map((u: any) => {
        const user: IUser = {
          id: u.id,
          userPrincipalName: u.userPrincipalName,
          displayName: u.displayName,
          jobTitle: u.jobTitle,
          department: u.department,
          city: u.city,
          country: u.country,
          companyName: u.companyName,
          officeLocation: u.officeLocation,
          onPremisesExtensionAttributes: Utils.getValuable(
            u.onPremisesExtensionAttributes
          ),
          manager: u.manager?.displayName,
          managerUpn: u.manager?.userPrincipalName,
        };
        return user;
      });
  }

  static resolveManagerUpn(users: IUser[]): void {
    const upns: { [key: string]: string } = users.reduce((acc: any, u) => {
      acc[u.userPrincipalName] = u.displayName;
      return acc;
    }, {});
    if (upns) {
      users.forEach(
        (u) => (u.managerUpnNotFound = !(!u.managerUpn || upns[u.managerUpn]))
      );
    }
  }
}
