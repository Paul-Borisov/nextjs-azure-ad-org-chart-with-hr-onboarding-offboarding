"use client";

import { Checkbox } from "@fluentui/react";
import ButtonActionStatus from "./ButtonActionStatus";
import { FormFields } from "@/shared/enums/formFields";
import { IFormState } from "@/shared/interfaces/iFormState";
import { ILocalizableClient } from "@/shared/interfaces/iLocalizable";
import { ITranslationResource } from "@/shared/interfaces/iTranslationResource";
import React, { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { IUser } from "@/shared/interfaces/iUser";

interface IOffboardEmployeeFormCheckboxes {
  canAddToSharepointList?: boolean;
  canManageAzureAccounts?: boolean;
  disable: boolean;
  remove: boolean;
  state: IFormState;
  translations: ITranslationResource;
  user: IUser | undefined;
  setDisable: (value: boolean) => void;
  setRemove: (value: boolean) => void;
}

const OffboardEmployeeForm = (
  props: IOffboardEmployeeFormCheckboxes & ILocalizableClient
) => {
  const [clearStatusIcon, setClearStatusIcon] = useState(false);
  const { pending: isSubmitting } = useFormStatus();
  useEffect(() => {
    if (isSubmitting) setClearStatusIcon(false);
  }, [isSubmitting, setClearStatusIcon]);
  const t = props.translations;
  const addCheckbox = ({
    fieldName,
    fieldLabelResource,
    hasErrors,
    isAllowed,
    isChecked,
    showIcon,
    tooltipResource,
    onChange,
  }: {
    fieldName: FormFields;
    fieldLabelResource: string;
    hasErrors: boolean;
    isAllowed: boolean | undefined;
    isChecked: boolean;
    showIcon: boolean;
    tooltipResource: string;
    onChange: (checked: boolean) => void;
  }) => {
    return (
      <div className="pt-8 flex items-center">
        <Checkbox
          name={fieldName}
          label={t(fieldLabelResource)}
          className={[
            "w-fit",
            isAllowed === undefined || !isAllowed ? "invisible" : "visible",
          ].join(" ")}
          disabled={isAllowed === undefined || !isAllowed}
          checked={isChecked}
          onChange={(_, checked) => {
            if (props.state.error) setClearStatusIcon(true);
            onChange(checked ? checked : false);
          }}
        />
        <ButtonActionStatus
          isInProgress={isSubmitting && isChecked && !!isAllowed}
          //showIcon={props.state.error && showIcon}
          showIcon={showIcon && !clearStatusIcon}
          tooltip={hasErrors ? t("errorOccurred") : t(tooltipResource)}
          iconName={!props.state.error ? "CheckMark" : "Error"}
          hasErrors={hasErrors}
        />
      </div>
    );
  };

  return (
    <>
      {addCheckbox({
        fieldName: FormFields.disableAccount,
        fieldLabelResource: "form_disableAccount",
        hasErrors: props.state.error && !props.state.listItemId,
        isAllowed: props.canAddToSharepointList || props.canManageAzureAccounts,
        isChecked: props.disable,
        showIcon: false,
        tooltipResource: "",
        onChange: (checked) => {
          props.setDisable(checked ? checked : false);
          if (checked) props.setRemove(false);
        },
      })}
      {addCheckbox({
        fieldName: FormFields.removeAccount,
        fieldLabelResource: "form_deleteAccount",
        hasErrors: props.state.error && !props.state.newPassword,
        isAllowed: props.canManageAzureAccounts && props.user?.isDirty,
        isChecked: props.remove,
        showIcon: false,
        tooltipResource: "",
        onChange: (checked) => {
          props.setRemove(checked ? checked : false);
          if (checked) props.setDisable(false);
        },
      })}
    </>
  );
};

export default OffboardEmployeeForm;
