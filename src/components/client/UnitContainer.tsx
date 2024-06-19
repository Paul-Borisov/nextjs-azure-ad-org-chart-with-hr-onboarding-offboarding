"use client";

import { HierarchyContext } from "@/components/contexts/hierarchyContext";
import { IHierarchyContext } from "@/components/contexts/iHierarchyContext";
import { IUnit } from "@/shared/interfaces/iUnit";
import LevelDialog from "./LevelDialog";
import { LevelDialogContent } from "./LevelDialogContent";
import Loading from "@/shared/components/Loading";
import { Suspense } from "react";
import { Unit } from "./Unit";
import { useTranslation } from "react-i18next";
import { useUnitContainer } from "./unitContainer.hooks";

// className with dynamically replaceable keys does not work unless you declare all dynamic keys exclicitly in the code.
// Using these static strings declarations in the code makes a trick.
// This way works: if tailwind finds declarations, it resolves dynamic keys correctly.
const cols = [
  "grid-cols-1",
  "grid-cols-2",
  "grid-cols-3",
  "grid-cols-4",
  "grid-cols-5",
  "col-span-1",
  "col-span-2",
  "col-span-3",
  "col-span-4",
  "col-span-5",
];

const UnitContainer = ({
  context,
  defaultColumns,
}: {
  context: IHierarchyContext;
  defaultColumns?: number;
}) => {
  const { t } = useTranslation();
  const { applyNewData, newData, searchId, selectedMaxColumns } =
    useUnitContainer({
      defaultColumns,
      translations: t,
    });
  context.searchId = searchId;

  return (
    <HierarchyContext.Provider value={context}>
      <Suspense fallback={<Loading text={t("loadingEmployees")} />}>
        {newData?.length ? (
          <div
            className={[
              `grid grid-cols-${selectedMaxColumns} gap-8 noheader:grid-cols-${selectedMaxColumns}`,
              "pl-16 pr-16 pt-14 tablet:pl-5 tablet:pr-5 tablet:block laptop:block laptop:pl-5 print:pt-0",
            ]
              .join(" ")
              .trim()}
          >
            <div className="fixed left-4 tablet:top-20 pt-5">
              <LevelDialog>
                {newData ? (
                  <LevelDialogContent
                    data={newData}
                    setNewData={applyNewData}
                  />
                ) : null}
              </LevelDialog>
            </div>
            {getHierarchy(newData, 1, context.collapseByDefault)}
          </div>
        ) : newData?.length === 0 ? (
          <div className="tablet:!pt-4 pt-8 text-center">
            {t("dataNotFound")}
          </div>
        ) : null}
      </Suspense>
    </HierarchyContext.Provider>
  );

  function getHierarchy(
    units: IUnit[],
    level: number,
    hideSubordinates?: boolean
  ): JSX.Element {
    return (
      <>
        {units?.map((unit) => (
          <div
            key={unit.name}
            className={
              unit.name === t("rootUnit")
                ? `col-span-${selectedMaxColumns} m-auto tablet:pt-0 print:pt-0`
                : "unit"
            }
          >
            <Unit context={context} unit={unit} translations={t} level={level}>
              {unit.units?.length
                ? getHierarchy(unit.units, level + 1, hideSubordinates)
                : null}
            </Unit>
          </div>
        ))}
      </>
    );
  }
};

export default UnitContainer;
