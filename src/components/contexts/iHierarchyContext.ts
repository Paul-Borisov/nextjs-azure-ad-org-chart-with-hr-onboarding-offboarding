import { IGlobalContext } from "./iGlobalContext";
import { ViewType } from "@/components/enums/viewType";

export interface IHierarchyContext extends IGlobalContext {
  cacheUseDatabase: boolean;
  collapseByDefault: boolean;
  collapseOnRoot: boolean;
  disabledCacheWarning?: boolean;
  excludeUsers: string[];
  isMockup: boolean;
  renderUserPhotoOnClient: boolean;
  renderUserPhotoOnServer: boolean;
  searchId?: string;
  userCardAttributes?: string[];
  viewType: ViewType;
}
