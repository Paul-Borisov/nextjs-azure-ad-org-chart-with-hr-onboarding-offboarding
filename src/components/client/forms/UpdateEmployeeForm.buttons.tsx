"use client";

import { IFormState } from "@/shared/interfaces/iFormState";
import { IUser } from "@/shared/interfaces/iUser";
import { FormFields } from "@/shared/enums/formFields";
import { optionalEmployeeId } from "./newEmployeeForm.hooks";
import { PanelContext } from "@/components/contexts/panelContext";
import React, { Dispatch, useContext } from "react";
import SendMail from "./SendMail";
import SubmitButton from "./SubmitButton";
import { useTranslation } from "react-i18next";

interface IUpdateEmployeeFormButtons {
  addToAzure: boolean;
  addToLocalAd: boolean;
  employeeId?: string;
  initialEmployeeId?: string;
  listItemId?: number | undefined;
  state: IFormState;
  submittedData: any;
  setAddToAzure: Dispatch<React.SetStateAction<boolean>>;
  setAddToLocalAd: Dispatch<React.SetStateAction<boolean>>;
  setInitialEmployeeId: Dispatch<React.SetStateAction<string | undefined>>;
}

const UpdateEmployeeFormButtons = (props: IUpdateEmployeeFormButtons) => {
  const { t } = useTranslation();
  const {
    manager: user,
    canAddToSharepointList,
    canManageAzureAccounts,
  } = useContext(PanelContext);

  const isAccountCreated =
    !props.state.error && props.submittedData && !!props.state.newPassword;
  const isFormActionSuceeded = !props.state?.error && props.state.message;
  const isSubmitButtonEnabled =
    (props.initialEmployeeId !== props.employeeId &&
      props.employeeId !== optionalEmployeeId) ||
    props.addToAzure ||
    props.addToLocalAd;

  return (
    <>
      <div className="grid col-span-2"></div>
      <div className="flex pt-10 pl-10 tablet:pl-0">
        <SubmitButton
          state={props.state}
          translations={t}
          cleanup={() => {
            if (isFormActionSuceeded) {
              if (props.addToAzure) props.setAddToAzure(false);
              if (props.addToLocalAd) props.setAddToLocalAd(false);
              if (props.employeeId)
                props.setInitialEmployeeId(props.employeeId);
              setTimeout(() => (props.state.message = ""), 200);
            }
          }}
          hasAllowedActions={canAddToSharepointList || canManageAzureAccounts}
          isFormValid={isSubmitButtonEnabled}
        />
      </div>
      <div
        className={[
          "pt-10 col-span-1",
          isAccountCreated ? undefined : "invisible",
        ]
          .join(" ")
          .trim()}
      >
        <SendMail
          manager={
            {
              displayName: user?.manager,
              userPrincipalName: user?.managerUpn,
            } as IUser
          }
          state={props.state}
          submittedData={{
            [FormFields.employeeId]: props.employeeId,
            [FormFields.displayName]: user?.displayName,
            [FormFields.jobTitle]: user?.jobTitle,
            [FormFields.userPrincipalName]: user?.userPrincipalName,
          }}
          translations={t}
        />
      </div>
    </>
  );
};

export default UpdateEmployeeFormButtons;
