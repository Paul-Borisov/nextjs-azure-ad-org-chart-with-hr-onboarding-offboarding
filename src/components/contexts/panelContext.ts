import { createContext } from "react";
import { IPanelContext } from "@/components/contexts/iPanelContext";
import { SidePanelActions } from "../enums/sidePanelActions";

export const PanelContext = createContext<IPanelContext>({
  canAddToSharepointLibrary: false,
  canAddToSharepointList: false,
  canManageAzureAccounts: false,
  data: undefined,
  isOpen: false,
  isLocalAdEnabled: false,
  isSharepointEnabled: false,
  manager: undefined,
  setIsOpen: () => undefined,
  setManager: () => undefined,
  setPanelAction: (action: SidePanelActions) => undefined,
});
