import { createContext } from "react";
import { IHierarchyContext } from "@/components/contexts/iHierarchyContext";
import { ViewType } from "@/components/enums/viewType";

export const HierarchyContext = createContext<IHierarchyContext>({
  cacheUseDatabase: false,
  collapseByDefault: false,
  collapseOnRoot: false,
  excludeUsers: [],
  isMockup: false,
  isLocalAdEnabled: false,
  isSharepointEnabled: false,
  renderUserPhotoOnClient: false,
  renderUserPhotoOnServer: false,
  userCardAttributes: undefined,
  viewType: ViewType.Hierarchy,
});
