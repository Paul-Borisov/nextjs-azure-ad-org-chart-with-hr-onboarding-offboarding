"use client";

import { Checkbox } from "@fluentui/react";
import ButtonActionStatus from "./ButtonActionStatus";
import { FormFields } from "@/shared/enums/formFields";
import { IFormState } from "@/shared/interfaces/iFormState";
import { ILocalizableClient } from "@/shared/interfaces/iLocalizable";
import { ITranslationResource } from "@/shared/interfaces/iTranslationResource";
import React, { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

interface INewEmployeeFormCheckboxes {
  addToAzure: boolean;
  addToLocalAd: boolean;
  addToSharepoint: boolean;
  canAddToSharepointList?: boolean;
  canManageAzureAccounts?: boolean;
  isLocalAdEnabled: boolean;
  state: IFormState;
  translations: ITranslationResource;
  setAddToAzure: (value: boolean) => void;
  setAddToLocalAd: (value: boolean) => void;
  setAddToSharepoint?: (value: boolean) => void;
}

const NewEmployeeFormCheckboxes = (
  props: INewEmployeeFormCheckboxes & ILocalizableClient
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

  const showIconAddToSharepoint =
    props.addToSharepoint && (props.state.error || !!props.state.listItemId);
  const showIconAddToAzure =
    props.addToAzure &&
    ((props.state.error && !props.state.newPassword) ||
      !!props.state.newPassword);
  const showIconAddToLocalAd =
    props.addToLocalAd &&
    ((props.state.error && !props.state.newPassword) ||
      !!props.state.newPassword);
  return (
    <>
      {props.setAddToSharepoint
        ? addCheckbox({
            fieldName: FormFields.addDataToSharepoint,
            fieldLabelResource: "form_createNewSharepointItem",
            hasErrors: props.state.error && !props.state.listItemId,
            isAllowed: props.canAddToSharepointList,
            isChecked: props.addToSharepoint,
            showIcon: showIconAddToSharepoint,
            tooltipResource: "created",
            onChange: (checked) =>
              props.setAddToSharepoint!(checked ? checked : false),
          })
        : null}
      {addCheckbox({
        fieldName: FormFields.createAzureAccount,
        fieldLabelResource: "form_createNewAzureAccount",
        hasErrors: props.state.error && !props.state.newPassword,
        isAllowed: props.canManageAzureAccounts,
        isChecked: props.addToAzure,
        showIcon: showIconAddToAzure,
        tooltipResource: "created",
        onChange: (checked) => {
          props.setAddToAzure(checked ? checked : false);
          if (checked) {
            props.setAddToLocalAd(false);
          }
        },
      })}
      {props.isLocalAdEnabled
        ? addCheckbox({
            fieldName: FormFields.createLocalAdAccount,
            fieldLabelResource: "form_createNewLocalAdAccount",
            hasErrors: props.state.error && !props.state.newPassword,
            isAllowed: props.canManageAzureAccounts,
            isChecked: props.addToLocalAd,
            showIcon: showIconAddToLocalAd,
            tooltipResource: "submitted",
            onChange: (checked) => {
              props.setAddToLocalAd(checked ? checked : false);
              if (checked) {
                props.setAddToAzure(false);
              }
            },
          })
        : null}
    </>
  );
};

export default NewEmployeeFormCheckboxes;
