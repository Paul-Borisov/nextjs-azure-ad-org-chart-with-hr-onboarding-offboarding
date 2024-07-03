import { reTrue } from "@/shared/lib/utils";

export class EnvSettingsClient {
  static newUserGroupsAzureAd =
    process.env.NEXT_PUBLIC_NEW_USER_GROUPS_AZURE_AD?.split(",") || [];

  static newUserGroupsLocalAd =
    process.env.NEXT_PUBLIC_NEW_USER_GROUPS_LOCAL_AD?.split(",") || [];

  static sendEmailCc = process.env.NEXT_PUBLIC_SEND_EMAIL_CC;

  static sendUserPrincipalNameByEmail = reTrue.test(
    process.env.NEXT_PUBLIC_SEND_USERPRINCIPALNAME_BY_EMAIL || ""
  );

  static sendPasswordByEmail = reTrue.test(
    process.env.NEXT_PUBLIC_SEND_PASSWORD_BY_EMAIL || ""
  );

  static shouldUseReduxQuery = reTrue.test(
    process.env.NEXT_PUBLIC_USE_REDUX_QUERY || ""
  );

  static shouldUseReduxStore = reTrue.test(
    process.env.NEXT_PUBLIC_USE_REDUX_STORE || ""
  );

  static userLevelDefaultAttributes =
    process.env.NEXT_PUBLIC_USER_LEVEL_DEFAULT_ATTRIBUTES?.split(",").map(
      (attr) => attr.trim()
    );
}
