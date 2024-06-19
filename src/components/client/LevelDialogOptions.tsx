import LevelDropdown from "./LevelDropdown";
import LevelUtils from "@/shared/lib/levelUtils";
import { useTranslation } from "react-i18next";

const maxLevels = 5;

export const LevelDialogOptions = ({
  availableUserAttributes,
  setPendingChanges,
  setPendingMaxColumns,
}: {
  availableUserAttributes: string[];
  setPendingChanges: (value: any) => void;
  setPendingMaxColumns: (value: any) => void;
}) => {
  const { t } = useTranslation();

  const addOrRemoveChanges = () => {
    setTimeout(() => setPendingChanges(LevelUtils.getUISelections() ?? []));
  };

  const addOrRemoveMaxColumns = () => {
    setTimeout(() =>
      setPendingMaxColumns(LevelUtils.getUISelectedMaxColumns() ?? "")
    );
  };

  const selectedLevels = LevelUtils.getSelectedLevels();
  const selectedMaxColumns = LevelUtils.getSelectedMaxColumns();
  const classNameForSelectedItem = LevelUtils.storageKey;
  const classNameForSelectedColumns = LevelUtils.storageKeyMaxColumns;

  return (
    <>
      <div className="flex flex-col gap-3 w-fit">
        {Array.from(Array(maxLevels).keys()).map((level) => {
          const key = `${t("level")} ${level + 1}`;
          const uiSelections =
            LevelUtils.getUISelections() ||
            (!LevelUtils.isDialogOpen() ? selectedLevels : undefined);
          return (uiSelections ? uiSelections.length : 0) >= level ? (
            <LevelDropdown
              key={key}
              title={key}
              options={availableUserAttributes.map((p) => ({
                text: LevelUtils.formatWithSpaces(
                  p.substring(p.lastIndexOf(".") + 1)
                ),
                value: p,
              }))}
              classNameForSelectedItem={classNameForSelectedItem}
              selectedValue={
                selectedLevels && selectedLevels.length >= level + 1
                  ? selectedLevels[level]
                  : undefined
              }
              addOrRemoveChanges={addOrRemoveChanges}
            />
          ) : null;
        })}
        <LevelDropdown
          title={t("maxColumns")}
          options={Array.from(Array(maxLevels).keys()).map((i) => ({
            text: (i + 1).toString(),
            value: (i + 1).toString(),
          }))}
          classNameForSelectedItem={classNameForSelectedColumns}
          selectedValue={selectedMaxColumns?.toString()}
          addOrRemoveChanges={addOrRemoveMaxColumns}
        />
      </div>
    </>
  );
};
