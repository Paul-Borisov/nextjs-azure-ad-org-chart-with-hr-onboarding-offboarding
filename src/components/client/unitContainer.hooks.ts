"use client";

import { ILocalizableClient } from "@/shared/interfaces/iLocalizable";
import { IUnit } from "@/shared/interfaces/iUnit";
import LevelUtils from "@/shared/lib/levelUtils";
import { PanelContext } from "../contexts/panelContext";
import { UnitMapper } from "@/shared/mappers/unitMapper";
import { useCallback, useContext, useEffect, useState } from "react";
import { useHierarchy } from "./hierarchyContainer.hooks";

export const useUnitContainer = ({
  defaultColumns = 2,
  translations,
}: {
  defaultColumns?: number;
} & ILocalizableClient) => {
  const t = translations;
  const { data } = useContext(PanelContext);
  const [newUserData, searchId, searchText] = useHierarchy(data);
  const [newData, setNewData] = useState<IUnit[]>();

  const applyNewData = useCallback((newData: IUnit[] | undefined) => {
    setNewData(newData);
  }, []);

  const selectedMaxColumns =
    LevelUtils.getSelectedMaxColumns() || defaultColumns.toString();

  useEffect(() => {
    const orgStructure = UnitMapper.getOrgStructure(
      newUserData,
      t("rootUnit"),
      t("undefinedUnit"),
      LevelUtils.getSelectedLevels()
    );

    setNewData(orgStructure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  return { applyNewData, newData, searchId, selectedMaxColumns };
};
