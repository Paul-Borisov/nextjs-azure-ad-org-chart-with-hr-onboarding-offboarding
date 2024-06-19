import { IUnit } from "@/shared/interfaces/iUnit";
import { IUser } from "@/shared/interfaces/iUser";
import { LevelDialogActions } from "./LevelDialogActions";
import { LevelDialogOptions } from "./LevelDialogOptions";
import Loading from "@/shared/components/Loading";
import { UnitMapper } from "@/shared/mappers/unitMapper";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Utils from "@/shared/lib/utils";

const excludeAttributes = /^id$|^level|upn|userprincipalname|displayname/i;

export const LevelDialogContent = ({
  data,
  setNewData,
}: {
  data: IUnit[];
  setNewData: (newData: IUnit[] | undefined) => void;
}) => {
  const { t } = useTranslation();
  const [allUsers, setAllUsers] = useState<IUser[] | undefined>();
  const [availableUserAttributes, setAvailableUserAttributes] =
    useState<string[]>();
  const [pendingChanges, setPendingChanges] = useState<string[]>();
  const [pendingMaxColumns, setPendingMaxColumns] = useState<string>();

  useEffect(() => {
    const allUsers = UnitMapper.extractAllUsers(data);
    const attributes = Utils.propertiesToArray(allUsers);
    setAllUsers(allUsers);
    setAvailableUserAttributes(
      attributes.filter((a) => !excludeAttributes.test(a))
    );
  }, [data]);

  return !availableUserAttributes ? (
    <Loading text={`${t("loadingData")}...`} />
  ) : (
    <>
      <LevelDialogOptions
        availableUserAttributes={availableUserAttributes}
        setPendingChanges={setPendingChanges}
        setPendingMaxColumns={setPendingMaxColumns}
      />
      <LevelDialogActions
        allUsers={allUsers}
        pendingChanges={pendingChanges}
        pendingMaxColumns={pendingMaxColumns}
        setNewData={setNewData}
        setPendingChanges={setPendingChanges}
        setPendingMaxColumns={setPendingMaxColumns}
      />
    </>
  );
};
