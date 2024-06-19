import { IGlobalContext } from "./iGlobalContext";
import { IUser } from "@/shared/interfaces/iUser";
import { SidePanelActions } from "../enums/sidePanelActions";

export interface IPanelContext extends IGlobalContext {
  canAddToSharepointLibrary?: boolean;
  canAddToSharepointList?: boolean;
  canManageAzureAccounts?: boolean;
  data?: IUser[];
  isOpen: boolean;
  isSharepointEnabled: boolean;
  manager?: IUser;
  setIsOpen: (value: boolean) => void;
  setManager: (user: IUser) => void;
  setPanelAction: (action: SidePanelActions) => void;
}
