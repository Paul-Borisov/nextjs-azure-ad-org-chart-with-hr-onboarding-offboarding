"use client";

import { IDropdown } from "@fluentui/react";
import { IFormState } from "@/shared/interfaces/iFormState";
import NewEmployeeFormCheckboxes from "./NewEmployeeForm.checkboxes";
import NewEmployeeFormGroups from "./NewEmployeeFormGroups";
import { PanelContext } from "@/components/contexts/panelContext";
import React, { useContext, useRef, useState } from "react";
import { updateEmployee } from "@/actions/formAction.update";
import UpdateEmployeeFormButtons from "./UpdateEmployeeForm.buttons";
import UpdateEmployeeFormFields from "./UpdateEmployeeForm.fields";
import {
  useAzureAdAccount,
  useFindEmployeeId,
  useUpdateEmployeeForm,
} from "./updateEmployeeForm.hooks";
import { useFormState } from "react-dom";
import { useTranslation } from "react-i18next";

export const initialState: IFormState = {
  error: false,
  message: "",
  newPassword: "",
};

const UpdateEmployeeForm = () => {
  const { t } = useTranslation();
  const [addToAzure, setAddToAzure] = useState(false);
  const [addToLocalAd, setAddToLocalAd] = useState(false);
  const refGroups = useRef<IDropdown>(null); // Reserved to getting access to selected items on the upper level

  const {
    canManageAzureAccounts,
    isLocalAdEnabled,
    isOpen: isPanelOpen,
    isSharepointEnabled,
    manager: user,
  } = useContext(PanelContext);

  const azureAdAccountExists = useAzureAdAccount(user?.userPrincipalName);
  const [
    employeeId,
    initialEmployeeId,
    listItemId,
    setEmployeeId,
    setInitialEmployeeId,
  ] = useFindEmployeeId(isPanelOpen, isSharepointEnabled, user);

  const [state, formAction] = useFormState(updateEmployee, initialState);
  const [submittedData, setSubmittedData] = useState();
  const {
    fieldErrors,
    isFormValid,
    handleSubmit,
    register,
    onFormDataValid,
    onFormDataInvalid,
  } = useUpdateEmployeeForm({
    setSubmittedData,
  });

  const isAccountCreated = !state.error && !!state.newPassword;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!isFormValid) e.preventDefault();
        handleSubmit(onFormDataValid, onFormDataInvalid)();
      }}
      className="pl-10 tablet:pl-0"
    >
      <div className="grid grid-cols-3 gap-3 pt-5 w-fit items-top">
        <UpdateEmployeeFormFields
          {...{
            addToAzure,
            addToLocalAd,
            employeeId,
            initialEmployeeId,
            listItemId,
            fieldErrors,
            state,
            register,
            setAddToAzure,
            setAddToLocalAd,
            setEmployeeId,
          }}
        />
        {azureAdAccountExists === false ? (
          <>
            {addToAzure || addToLocalAd ? (
              <NewEmployeeFormGroups
                addToAzure={addToAzure}
                addToLocalAd={addToLocalAd}
                translations={t}
                ref={refGroups}
              />
            ) : null}
            {!isAccountCreated && canManageAzureAccounts ? (
              <NewEmployeeFormCheckboxes
                {...{
                  addToAzure,
                  addToLocalAd,
                  addToSharepoint: false,
                  canAddToSharepointList: false,
                  canManageAzureAccounts,
                  isLocalAdEnabled,
                  state,
                  translations: t,
                  setAddToAzure,
                  setAddToLocalAd,
                }}
              />
            ) : null}
          </>
        ) : null}
        <UpdateEmployeeFormButtons
          {...{
            addToAzure,
            addToLocalAd,
            employeeId,
            initialEmployeeId,
            listItemId,
            state,
            submittedData,
            setAddToAzure,
            setAddToLocalAd,
            setInitialEmployeeId,
          }}
        />
      </div>
    </form>
  );
};

export default UpdateEmployeeForm;
