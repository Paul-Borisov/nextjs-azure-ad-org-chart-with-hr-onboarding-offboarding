"use client";

import Hierarchy from "./Hierarchy";
import { HierarchyContext } from "@/components/contexts/hierarchyContext";
import HierarchyNode from "./HierarchyNode";
import { IHierarchyContext } from "@/components/contexts/iHierarchyContext";
import { IUser } from "@/shared/interfaces/iUser";
import Loading from "@/shared/components/Loading";
import { Suspense, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ViewType } from "../enums/viewType";
import { useHierarchy } from "./hierarchyContainer.hooks";
import { PanelContext } from "../contexts/panelContext";
import { topManagers } from "@/shared/mappers/unitMapper";

const HierarchyContainer = ({
  context,
  data,
  handleMissingManagerUpn,
}: {
  context: IHierarchyContext;
  data?: IUser[];
  handleMissingManagerUpn?: boolean;
}) => {
  const { t } = useTranslation();
  const { data: allUsers } = useContext(PanelContext);
  const [newData, searchId] = useHierarchy(data ?? allUsers);
  const handleMissingManagers = handleMissingManagerUpn || !!searchId;
  if (context.viewType === ViewType.Hierarchy) {
    context.searchId = searchId;
  }

  const classNameRoot =
    context.viewType === ViewType.Hierarchy
      ? "pt-8 pl-4 tablet:!pt-4 tablet:pl-5 laptop:pt-14 print:pt-0"
      : "pt-4 pl-4 tablet:pl-5 print:pt-0";

  return (
    <HierarchyContext.Provider value={context}>
      {newData?.length ? (
        <div className={classNameRoot}>
          {getHierarchy(undefined, context.collapseByDefault)}
        </div>
      ) : newData?.length === 0 ? (
        <div className={[classNameRoot, "text-center"].join(" ").trim()}>
          {t("dataNotFound")}
        </div>
      ) : null}
    </HierarchyContext.Provider>
  );

  function getHierarchy(managerUpn?: string, hideSubordinates?: boolean) {
    const currentLevelUsers = newData
      ?.filter(
        (u) =>
          !context.excludeUsers.some(
            (e) => u.userPrincipalName.indexOf(e) > -1
          ) &&
          (u.managerUpn === managerUpn ||
            (!managerUpn &&
              handleMissingManagers &&
              !newData.find((user) => user.userPrincipalName === u.managerUpn)))
      )
      .sort((a, b) =>
        topManagers.test(a.jobTitle) && topManagers.test(b.jobTitle)
          ? a.displayName.localeCompare(b.displayName)
          : topManagers.test(a.jobTitle)
          ? -1
          : topManagers.test(b.jobTitle)
          ? 1
          : a.displayName.localeCompare(b.displayName)
      );

    if (!managerUpn && !handleMissingManagers && !currentLevelUsers?.length)
      return <div>{t("errorTopManagersNotFound")}</div>;

    const dataSource = () =>
      currentLevelUsers?.map((u) => {
        return (
          <HierarchyNode
            key={u.id}
            user={u}
            getHierarchy={getHierarchy}
            hideSubordinates={hideSubordinates}
            translations={t}
          />
        );
      });

    return (
      <Suspense fallback={<Loading text={t("loadingManagers")} />}>
        {!managerUpn ? (
          <div className="justify-start">
            <Hierarchy
              dataSource={() => <>{dataSource()}</>}
              isCollapsed={false}
            />
          </div>
        ) : (
          <Hierarchy
            dataSource={() => <>{dataSource()}</>}
            isCollapsed={false}
          />
        )}
      </Suspense>
    );
  }
};

export default HierarchyContainer;
