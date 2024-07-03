import { IHierarchyContext } from "@/components/contexts/iHierarchyContext";
import HierarchyContainer from "../HierarchyContainer";
import React from "react";
import UnitContainer from "../UnitContainer";
import { ViewType } from "@/components/enums/viewType";

interface WithViewTypeProps {
  context: IHierarchyContext;
  viewType: ViewType;
}
const WithViewType = ({ context, viewType }: WithViewTypeProps) => {
  return viewType === ViewType.Hierarchy ? (
    <HierarchyContainer context={context} />
  ) : viewType === ViewType.Units ? (
    <UnitContainer context={context} />
  ) : null;
};

export default WithViewType;
