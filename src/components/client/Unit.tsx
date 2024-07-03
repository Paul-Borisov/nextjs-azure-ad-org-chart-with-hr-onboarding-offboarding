import { collapseAll } from "./Collapsible";
import { Constants } from "@/shared/lib/constants";
import HierarchyContainer from "./HierarchyContainer";
import { HierarchyContext } from "@/components/contexts/hierarchyContext";
import { IHierarchyContext } from "@/components/contexts/iHierarchyContext";
import { ITranslationResource } from "@/shared/interfaces/iTranslationResource";
import { IUnit } from "@/shared/interfaces/iUnit";
import PlusMinus from "./PlusMinus";
import { ReactNode, useContext, useMemo, useState } from "react";

export const Unit = ({
  context,
  translations: t,
  unit,
  level,
  children,
}: {
  context: IHierarchyContext;
  translations: ITranslationResource;
  unit?: IUnit;
  level: number;
  children: ReactNode;
}) => {
  const { collapseByDefault, collapseOnRoot } = useContext(HierarchyContext);
  const [isCollapsed, setIsCollapsed] = useState<boolean | undefined>(
    collapseByDefault
  );
  const rootUnitName = t("rootUnit");

  const plusMinus = useMemo(
    () => (
      <PlusMinus
        isCollapsed={!!isCollapsed}
        className={`${Constants.classNameCollapsible} -ml-9 -mt-1`}
      />
    ),
    [isCollapsed]
  );

  let className;
  switch (level) {
    case 1:
      className = "text-[18px]";
      break;
    case 2:
      className = "text-2xl print:text-[18px]";
      break;
    case 3:
      className = "text-xl";
      break;
    default:
      className = "text-sm";
      break;
  }

  return unit ? (
    <>
      <div
        className={[
          "p-3 pb-0 cursor-default",
          className,
          level === 1
            ? "border-2 rounded text-center print:border-0 print:text-start min-w-60 h-14"
            : undefined,
        ]
          .join(" ")
          .trim()}
        onClick={(e) => {
          setIsCollapsed((prev) => !prev);
          const canCollapseAll = collapseOnRoot && unit.name === rootUnitName;
          if (canCollapseAll) collapseAll();
        }}
      >
        {plusMinus}
        <span className="line-clamp-1">{unit.name}</span>
      </div>
      {unit.e ? (
        <div className={isCollapsed ? "hidden" : "block"}>
          <HierarchyContainer
            context={context}
            data={unit.e}
            handleMissingManagerUpn={true}
          />
        </div>
      ) : null}
      {children ? (
        <div className={isCollapsed ? "hidden" : "block"}>{children}</div>
      ) : null}
    </>
  ) : null;
};
