import { IUnit } from "@/shared/interfaces/iUnit";
import { IUser } from "@/shared/interfaces/iUser";
import { LevelActionButton } from "./LevelActionButton";
import LevelUtils from "@/shared/lib/levelUtils";
import { UnitMapper } from "@/shared/mappers/unitMapper";
import { useRefresh } from "@/shared/hooks/useRefresh";
import { useTranslation } from "react-i18next";

export const LevelDialogActions = ({
  allUsers,
  pendingChanges,
  pendingMaxColumns,
  setNewData,
  setPendingChanges,
  setPendingMaxColumns,
}: {
  allUsers?: IUser[] | undefined;
  pendingChanges: string[] | undefined;
  pendingMaxColumns: string | undefined;
  setNewData: (newData: IUnit[] | undefined) => void;
  setPendingChanges: (value: any) => void;
  setPendingMaxColumns: (value: any) => void;
}) => {
  const { t } = useTranslation();
  const refresh = useRefresh();

  const selectedLevels = LevelUtils.getSelectedLevels();
  const selectedMaxColumns = LevelUtils.getSelectedMaxColumns();
  const rootUnit = t("rootUnit");
  const undefinedUnit = t("undefinedUnit");

  return (
    <div className="flex justify-end gap-2 whitespace-nowrap tablet:pt-3 tablet:justify-start">
      <LevelActionButton
        onClick={() => {
          const uiSelectedKevelChanges = LevelUtils.getUISelections();
          const newData = UnitMapper.getOrgStructure(
            allUsers,
            rootUnit,
            undefinedUnit,
            uiSelectedKevelChanges && uiSelectedKevelChanges.length > 0
              ? uiSelectedKevelChanges
              : undefined
          );
          setNewData(newData);

          if (uiSelectedKevelChanges?.length) {
            LevelUtils.saveSelectedLevels(uiSelectedKevelChanges);
          } else {
            LevelUtils.cleanSelectedLevels();
          }
          setPendingChanges(undefined);

          const uiSelectedMaxColumns = LevelUtils.getUISelectedMaxColumns();
          if (uiSelectedMaxColumns) {
            LevelUtils.saveSelectedMaxColumns(uiSelectedMaxColumns);
          } else {
            LevelUtils.cleanSelectedMaxColumns();
          }
          setPendingMaxColumns(undefined);
        }}
        title={t("applyChanges")}
        disabled={!pendingChanges && pendingMaxColumns === undefined}
      />
      <LevelActionButton
        onClick={() => {
          const newData = UnitMapper.getOrgStructure(
            allUsers,
            rootUnit,
            undefinedUnit
          );
          setNewData(newData);
          LevelUtils.cleanSelectedLevels();
          setPendingChanges(undefined);
          LevelUtils.cleanSelectedMaxColumns();
          setPendingMaxColumns(undefined);
          refresh();
        }}
        title={t("reset")}
        disabled={!selectedLevels && !selectedMaxColumns}
      />
    </div>
  );
};
