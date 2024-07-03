import { Constants } from "@/shared/lib/constants";
import { Dispatch, ReactNode, SetStateAction } from "react";

export interface ICollapsible {
  canCollapseAll: boolean;
  children: ReactNode;
  className?: string;
  rootLevel?: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean | undefined>>;
}

export const collapseAll = (className = Constants.classNameCollapsible) => {
  setTimeout(() => {
    let rootLevelClicked = false;
    document
      .querySelectorAll<HTMLDivElement>(`.${className}`)
      .forEach((el, index) => {
        const isRootLevel =
          !!el.parentElement?.className.includes("root-level");
        if (!isRootLevel && index === 0) return;
        if (!isRootLevel || !rootLevelClicked) el?.click();
        if (isRootLevel) rootLevelClicked = true;
      });
  });
};

export const Collapsible = ({
  canCollapseAll,
  children,
  className = "flex items-center",
  rootLevel,
  setIsCollapsed,
}: ICollapsible) => {
  return (
    <div
      className={[className, rootLevel ? "root-level" : undefined]
        .join(" ")
        .trim()}
      onClick={(e) => {
        if (canCollapseAll) collapseAll();
        setIsCollapsed((prev) => !prev);
      }}
    >
      {children}
    </div>
  );
};
