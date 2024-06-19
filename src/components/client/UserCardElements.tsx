import { IUser } from "@/shared/interfaces/iUser";
import { ITranslationResource } from "@/shared/interfaces/iTranslationResource";
import Utils from "@/shared/lib/utils";

interface IUserCardElements {
  attributes: JSX.Element[];
  first: string;
  second: string;
  third: string;
  fourth: string;
}

export const getElements = ({
  user,
  userCardAttributes,
  translations: t,
}: {
  user: IUser;
  userCardAttributes: string[] | undefined;
  translations: ITranslationResource;
}): IUserCardElements => {
  const allAttributes = Utils.propertiesToArray(user);
  const desiredAttributes: string[] = Array.isArray(userCardAttributes)
    ? JSON.parse(JSON.stringify(userCardAttributes))
    : allAttributes;
  if (desiredAttributes !== allAttributes) {
    allAttributes.forEach((a) => {
      const index = desiredAttributes.findIndex((d) =>
        a.toLocaleLowerCase().endsWith(d.toLocaleLowerCase())
      );
      if (index > -1 && desiredAttributes[index] !== a) {
        desiredAttributes[index] = a;
      }
    });
  }

  const values: string[] = [];
  const attributes: JSX.Element[] = [];
  desiredAttributes.forEach((key) => {
    const value = eval(`user.${key}`)?.toString();
    if (!value) return;
    values.push(value);

    const loc = `userProp_${key.substring(key.lastIndexOf(".") + 1)}`;
    let title = t(loc);
    if (title === loc) title = key;

    attributes.push(
      <div key={key} className="flex gap-5 tablet:block">
        <div className="font-semibold">{title}:</div>
        <div>{value}</div>
      </div>
    );
  });

  const first = values.length > 0 ? values[0] : user.displayName;
  const second = values.length > 1 ? values[1] : user.userPrincipalName;
  const third = values.length > 2 ? values[2] : user.jobTitle;
  const fourth = values.length > 3 ? values[3] : user.officeLocation;

  return { attributes, first, second, third, fourth };
};
