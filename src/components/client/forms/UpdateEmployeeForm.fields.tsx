"use client";

import { IFormState } from "@/shared/interfaces/iFormState";
import { FieldError, FieldErrors, UseFormRegister } from "react-hook-form";
import { FormFields } from "@/shared/enums/formFields";
import NewEmployeeLabelField from "./NewEmployeeLabelField";
import NewEmployeeTextField from "./NewEmployeeTextField";
import { optionalEmployeeId } from "./newEmployeeForm.hooks";
import { PanelContext } from "@/components/contexts/panelContext";
import React, { Dispatch, useContext } from "react";
import { useTranslation } from "react-i18next";

interface IUpdateEmployeeFormFields {
  addToAzure: boolean;
  addToLocalAd: boolean;
  employeeId?: string;
  initialEmployeeId?: string;
  listItemId?: number | undefined;
  fieldErrors: FieldErrors<any>;
  state: IFormState;
  register: UseFormRegister<any>;
  setAddToAzure: Dispatch<React.SetStateAction<boolean>>;
  setAddToLocalAd: Dispatch<React.SetStateAction<boolean>>;
  setEmployeeId: Dispatch<React.SetStateAction<string | undefined>>;
}

const UpdateEmployeeFormFields = (props: IUpdateEmployeeFormFields) => {
  const {
    manager: user,
    canAddToSharepointList,
    canManageAzureAccounts,
    isSharepointEnabled,
  } = useContext(PanelContext);

  const { t } = useTranslation();

  return (
    <>
      <NewEmployeeLabelField
        name={FormFields.manager}
        title={t("userProp_employee")}
        value={user?.displayName}
        waitForLoadingValue={true}
      />
      <input
        type="hidden"
        name={FormFields.userPrincipalName}
        value={user?.userPrincipalName}
      />
      <NewEmployeeTextField
        name={FormFields.employeeId}
        title={t("userProp_employeeId")}
        required={false}
        //textComment={t("required")}
        register={props.register}
        value={props.employeeId !== optionalEmployeeId ? props.employeeId : ""}
        waitForLoadingValue={
          isSharepointEnabled && props.employeeId !== optionalEmployeeId
        }
        onChange={(value: string) => {
          props.setEmployeeId(value ? value : props.initialEmployeeId);
        }}
        fieldError={props.fieldErrors[FormFields.employeeId] as FieldError}
      />
      {canAddToSharepointList && props.listItemId ? (
        <input
          type="hidden"
          name={FormFields.listItemId}
          value={props.listItemId}
        />
      ) : null}
      <>
        <input
          type="hidden"
          name={FormFields.userPrincipalName}
          value={user?.userPrincipalName}
        />
        {canManageAzureAccounts ? (
          <input type="hidden" name={FormFields.updateAdAccount} value="on" />
        ) : null}
      </>
    </>
  );
};

export default UpdateEmployeeFormFields;
