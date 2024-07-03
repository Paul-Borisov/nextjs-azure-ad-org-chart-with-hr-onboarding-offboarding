import { EnvSettingsClient } from "@/shared/lib/envSettingsClient";
import { FormFields } from "@/shared/enums/formFields";
import { IFormState } from "@/shared/interfaces/iFormState";
import { ITranslationResource } from "@/shared/interfaces/iTranslationResource";
import { IUser } from "@/shared/interfaces/iUser";
import { useSession } from "next-auth/react";
import Utils from "@/shared/lib/utils";

const SendMail = ({
  manager,
  state,
  submittedData,
  translations: t,
}: {
  manager: IUser;
  state: IFormState;
  submittedData: any;
  translations: ITranslationResource;
}) => {
  const { data: session } = useSession();

  const formatEmailBody = () => {
    const formatKeyValue = (key: string, value: string) => {
      const translationKey = `userProp_${Utils.decapitalizeFirstWord(key)}`;
      const text = t(translationKey);
      return ` • ${text !== translationKey ? text : key}: ${value}`;
    };

    const rows: string[] = [];
    Object.keys(submittedData)
      /*.sort((a, b) =>
        a.toLocaleLowerCase() > b.toLocaleLowerCase()
          ? 1
          : a.toLocaleLowerCase() < b.toLocaleLowerCase()
          ? -1
          : 0
      )*/
      .forEach((key) => {
        const value = submittedData[key];
        if (!value) return;
        const translationKey = `userProp_${Utils.decapitalizeFirstWord(
          key,
          "_x0020_"
        )}`;
        const text = t(translationKey);
        rows.push(` • ${text !== translationKey ? text : key}: ${value}`);
      });
    if (
      EnvSettingsClient.sendUserPrincipalNameByEmail &&
      state.newUserPrincipalName
    ) {
      rows.push(
        formatKeyValue(FormFields.userPrincipalName, state.newUserPrincipalName)
      );
    }
    if (EnvSettingsClient.sendPasswordByEmail && state.newPassword) {
      rows.push(formatKeyValue("password", state.newPassword));
    }
    return `${t("mailHeader").replace(
      /\{0\}/g,
      manager.displayName
    )}${rows.join("\n\n")}${t("mailFooter").replace(
      /\{0\}/g,
      session?.user.name || ""
    )}`;
  };

  const formatMailAddress = () => {
    return `mailto:${manager.userPrincipalName}?subject=${encodeURIComponent(
      t("email_subjectUserAccountCreated")
    )}${
      EnvSettingsClient.sendEmailCc
        ? `&cc=${EnvSettingsClient.sendEmailCc}`
        : ""
    }&body=${encodeURIComponent(formatEmailBody())}`;
  };

  return (
    <div
      className="border border-gray-400 rounded w-60 text-nowrap font-semibold leading-7 text-center cursor-pointer"
      onClick={(e) => {
        window.location.href = formatMailAddress();
        e.preventDefault();
      }}
    >
      {t("email_button")}
    </div>
  );
};

export default SendMail;
