"use client";

import { addNewEmployee } from "@/actions/formAction.add";
import { FormFields } from "@/shared/enums/formFields";
import { IFormState } from "@/shared/interfaces/iFormState";
import NewEmployeeFormButtons from "./NewEmployeeForm.buttons";
import NewEmployeeFormCheckboxes from "./NewEmployeeForm.checkboxes";
import NewEmployeeFormFields from "./NewEmployeeForm.fields";
import { PanelContext } from "@/components/contexts/panelContext";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useNewEmployeeForm, useNewEmployeeId } from "./newEmployeeForm.hooks";
import { useTranslation } from "react-i18next";

export const initialState: IFormState = {
  error: false,
  listItemId: undefined,
  message: "",
  newPassword: undefined,
  newUserPrincipalName: undefined,
};
export const isInitialState = (state: IFormState) =>
  !(state.error || state.listItemId || state.newUserPrincipalName);

const NewEmployeeForm = () => {
  const {
    isOpen: isPanelOpen,
    manager,
    canAddToSharepointList,
    canManageAzureAccounts,
    isLocalAdEnabled,
    isSharepointEnabled,
  } = useContext(PanelContext);
  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [, setDisplayName] = useState<string>();
  const [addToAzure, setAddToAzure] = useState(false);
  const [addToLocalAd, setAddToLocalAd] = useState(false);
  const [submittedData, setSubmittedData] = useState();
  const [state, formAction] = useFormState(addNewEmployee, initialState);
  const [employeeId, isValidSiteUserForManager, setEmployeeId] =
    useNewEmployeeId(
      isPanelOpen,
      isSharepointEnabled,
      manager?.userPrincipalName as string
    );
  const [addToSharepoint, setAddToSharepoint] = useState(
    !!canAddToSharepointList
  );
  const addToSharepointForManager =
    addToSharepoint && isValidSiteUserForManager;

  const { t } = useTranslation();

  const {
    fieldErrors,
    isFormValid,
    handleSubmit,
    register,
    reset,
    getValues,
    setValue,
    onFormDataValid,
    onFormDataInvalid,
  } = useNewEmployeeForm({
    addToSharepoint: addToSharepointForManager,
    employeeId,
    setEmployeeId,
    setSubmittedData,
  });

  // useCallback used here just to avoid excessive useEffect triggering in SubmitButton
  const cleanupOnSuccess = useCallback(() => {
    reset();
    // Usage of defaultValues of useForm does not work correctly:
    // it removes autogenerated employeeId and does not reset placeholder
    // Replaced by explicit cleanups instead.
    setEmployeeId(undefined);
    setFirstName(undefined);
    setLastName(undefined);
    setDisplayName(undefined);
  }, [reset, setEmployeeId]);

  // The fix for invalid form state after autofill in Edge. Dear Microsoft, why Edge does not respect autofill="off"?
  // The following logic compares current formValues with actual values of required fields and syncs them if necessary.
  // Explained in https://github.com/orgs/react-hook-form/discussions/1882
  useEffect(() => {
    if (!(firstName || lastName)) return;
    const formValues = getValues();
    if (formValues[FormFields.firstName] !== firstName) {
      setValue(FormFields.firstName, firstName || "");
    }
    if (formValues[FormFields.lastName] !== lastName) {
      setValue(FormFields.lastName, lastName || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, lastName]);

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
        <NewEmployeeFormFields
          {...{
            addToSharepoint,
            addToAzure,
            addToLocalAd,
            manager,
            employeeId,
            firstName,
            lastName,
            register,
            fieldErrors,
            reset,
            setEmployeeId,
            setFirstName,
            setLastName,
            setDisplayName,
          }}
        />
        <NewEmployeeFormCheckboxes
          {...{
            addToAzure,
            addToLocalAd,
            addToSharepoint: addToSharepointForManager,
            canAddToSharepointList:
              canAddToSharepointList && isValidSiteUserForManager,
            canManageAzureAccounts,
            isLocalAdEnabled,
            state,
            translations: t,
            setAddToAzure,
            setAddToLocalAd,
            setAddToSharepoint,
          }}
        />
        <NewEmployeeFormButtons
          {...{
            addToAzure,
            addToLocalAd,
            addToSharepoint: addToSharepointForManager,
            state,
            submittedData,
            translations: t,
            cleanup: cleanupOnSuccess,
          }}
        />
      </div>
    </form>
  );
};

export default NewEmployeeForm;
