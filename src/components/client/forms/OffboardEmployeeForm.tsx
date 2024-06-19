"use client";

import { IFormState } from "@/shared/interfaces/iFormState";
import { FormFields } from "@/shared/enums/formFields";
import NewEmployeeLabelField from "./NewEmployeeLabelField";
import { offboardEmployee } from "@/actions/formAction.offboard";
import OffboardEmployeeFormCheckboxes from "./OffboardEmployeeForm.checkboxes";
import { PanelContext } from "@/components/contexts/panelContext";
import React, { useContext, useState } from "react";
import SubmitButton from "./SubmitButton";
import { useFormState } from "react-dom";
import { useOffboardEmployeeForm } from "./offboardEmployeeForm.hooks";
import { useTranslation } from "react-i18next";

export const initialState: IFormState = {
  error: false,
  message: "",
};
export const isInitialState = (state: IFormState) =>
  !(state.error || state.listItemId || state.newUserPrincipalName);

const OffboardEmployeeForm = () => {
  const {
    manager: user,
    canAddToSharepointList,
    canManageAzureAccounts,
  } = useContext(PanelContext);

  const [state, formAction] = useFormState(offboardEmployee, initialState);
  const { isFormValid, handleSubmit, onFormDataValid, onFormDataInvalid } =
    useOffboardEmployeeForm();
  const { t } = useTranslation();
  const [disable, setDisable] = useState(false);
  const [remove, setRemove] = useState(false);

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
        <input
          type="hidden"
          name={FormFields.displayName}
          value={user?.displayName}
        />
        <OffboardEmployeeFormCheckboxes
          {...{
            disable,
            remove,
            canAddToSharepointList,
            canManageAzureAccounts,
            state,
            translations: t,
            user,
            setDisable,
            setRemove,
          }}
        />
        <div className="grid col-span-2"></div>
        <div className="flex pt-10 pl-10 tablet:pl-0">
          <SubmitButton
            cleanup={() => {}}
            state={state as any}
            translations={t}
            hasAllowedActions={canAddToSharepointList || canManageAzureAccounts}
            isFormValid={disable || remove}
          />
        </div>
        {remove ? (
          <>
            <div></div>
            <div></div>
            <div className="text-yellow-300 font-bold pl-10 tablet:pl-0">
              {t("form_deleteThisAccount")}
            </div>
          </>
        ) : null}
      </div>
    </form>
  );
};

export default OffboardEmployeeForm;
