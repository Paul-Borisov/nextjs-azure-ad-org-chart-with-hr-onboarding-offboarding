"use client";

import { IHierarchyContext } from "@/components/contexts/iHierarchyContext";
import { IUser } from "@/shared/interfaces/iUser";
import NewEmployeeForm from "../forms/NewEmployeeForm";
import { PanelContext } from "@/components/contexts/panelContext";
import { ReactNode, useState } from "react";
import { SidePanelActions } from "@/components/enums/sidePanelActions";
import SidePanelEmployeeForm from "./SidePanelEmployeeForm";
import UpdateEmployeeForm from "../forms/UpdateEmployeeForm";
import { useCanManageAccounts } from "./sidePanelContext.hooks";
import { useTranslation } from "react-i18next";
import OffboardEmployeeForm from "../forms/OffboardEmployeeForm";

const SidePanelContext = ({
  children,
  context,
  data,
}: {
  children: ReactNode;
  context: IHierarchyContext;
  data?: IUser[];
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [manager, setManager] = useState<IUser>();
  const [panelAction, setPanelAction] = useState<SidePanelActions>();
  const {
    canManageAzureAccounts,
    canAddToSharepointList,
    canAddToSharepointLibrary,
  } = useCanManageAccounts(context.isSharepointEnabled);
  const { t } = useTranslation();

  return (
    <PanelContext.Provider
      value={{
        canAddToSharepointLibrary,
        canAddToSharepointList,
        canManageAzureAccounts,
        data,
        isOpen: isPanelOpen,
        isLocalAdEnabled: context.isLocalAdEnabled,
        isSharepointEnabled: context.isSharepointEnabled,
        manager,
        setIsOpen: setIsPanelOpen,
        setManager,
        setPanelAction,
      }}
    >
      {children}
      {panelAction === SidePanelActions.createEmployee ? (
        <SidePanelEmployeeForm
          headerText={t("newEmployee")}
          isOpen={isPanelOpen}
          setIsOpen={setIsPanelOpen}
        >
          <NewEmployeeForm />
        </SidePanelEmployeeForm>
      ) : null}
      {panelAction === SidePanelActions.updateEmployee ? (
        <SidePanelEmployeeForm
          headerText={t("updateEmployee")}
          isOpen={isPanelOpen}
          setIsOpen={setIsPanelOpen}
        >
          <UpdateEmployeeForm />
        </SidePanelEmployeeForm>
      ) : null}
      {panelAction === SidePanelActions.offboardEmployee ? (
        <SidePanelEmployeeForm
          headerText={t("offboardEmployee")}
          isOpen={isPanelOpen}
          setIsOpen={setIsPanelOpen}
        >
          <OffboardEmployeeForm />
        </SidePanelEmployeeForm>
      ) : null}
    </PanelContext.Provider>
  );
};

export default SidePanelContext;
