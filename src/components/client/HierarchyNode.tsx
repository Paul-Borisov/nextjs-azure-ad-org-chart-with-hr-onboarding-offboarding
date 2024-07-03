import { Collapsible } from "./Collapsible";
import { Constants } from "@/shared/lib/constants";
import Hierarchy from "./Hierarchy";
import { HierarchyContext } from "@/components/contexts/hierarchyContext";
import { ILocalizableClient } from "@/shared/interfaces/iLocalizable";
import { Initials } from "./Initials";
import { IUser } from "@/shared/interfaces/iUser";
import Loading from "@/shared/components/Loading";
import Photo from "./Photo";
import PlusMinus from "./PlusMinus";
import { Suspense, createRef, useContext, useState } from "react";
import UserCard from "./UserCard";
import { ViewType } from "../enums/viewType";

const HierarchyNode = ({
  user: u,
  translations: t,
  getHierarchy,
  hideSubordinates,
}: {
  user: IUser;
  getHierarchy: (
    managerUpn: string,
    isCollapsed?: boolean
  ) => JSX.Element | undefined;
  hideSubordinates?: boolean;
} & ILocalizableClient) => {
  const { collapseByDefault, collapseOnRoot, searchId, viewType } =
    useContext(HierarchyContext);
  const [isCollapsed, setIsCollapsed] = useState<boolean | undefined>(
    hideSubordinates
  );
  const [isUserCard, setIsUserCard] = useState(false);
  const refPhoto = createRef<HTMLImageElement>();

  const plusMinus = (
    <PlusMinus
      isCollapsed={!!isCollapsed}
      className={Constants.classNameCollapsible}
    />
  );

  const getSubordinates = (managerUpn: string) => {
    const subordinates = getHierarchy(managerUpn, collapseByDefault);
    return subordinates ? <div className="pl-8">{subordinates}</div> : null;
  };

  const canCollapseAll =
    collapseOnRoot &&
    !isCollapsed &&
    !u.managerUpn &&
    viewType === ViewType.Hierarchy;

  const getDisplayName = () => {
    if (searchId) {
      return u.jobTitle ? (
        <>
          <a id={searchId} className="text-blue-600 dark:text-blue-300">
            {u.displayName}
          </a>
          <span>, {u.jobTitle}</span>
        </>
      ) : (
        <>{u.displayName}</>
      );
    } else {
      return (
        <>{u.jobTitle ? `${u.displayName}, ${u.jobTitle}` : u.displayName}</>
      );
    }
  };

  return (
    <div key={u.id}>
      <div className="flex items-center pb-3">
        <Suspense
          fallback={
            isCollapsed === undefined ? (
              <Loading text={t("loadingManagers")} />
            ) : (
              <>
                {plusMinus}
                <Initials title={u.displayName} />
              </>
            )
          }
        >
          <Collapsible
            canCollapseAll={canCollapseAll}
            rootLevel={!u.managerUpn}
            setIsCollapsed={setIsCollapsed}
          >
            {plusMinus}
            <Photo ref={refPhoto} user={u} />
          </Collapsible>
        </Suspense>
        <UserCard activate={isUserCard} user={u} refPhoto={refPhoto}>
          <div
            className="cursor-default print:text-black print:bg-white"
            onMouseOver={() => setIsUserCard(true)}
            onClick={() => setIsUserCard(true)}
          >
            {getDisplayName()}
          </div>
        </UserCard>
      </div>
      <Suspense
        fallback={
          isCollapsed === undefined && (
            <Loading text={t("loadingSubordinates")} />
          )
        }
      >
        <Hierarchy
          dataSource={() => getSubordinates(u.userPrincipalName)}
          isCollapsed={!!isCollapsed}
        />
      </Suspense>
    </div>
  );
};
export default HierarchyNode;
