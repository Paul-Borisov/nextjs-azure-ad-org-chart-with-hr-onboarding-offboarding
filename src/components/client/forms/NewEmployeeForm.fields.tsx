import { Dispatch, useRef } from "react";
import { FieldError, FieldErrors, UseFormRegister } from "react-hook-form";
import { FontIcon, IDropdown } from "@fluentui/react";
import { FormFields } from "@/shared/enums/formFields";
import { IUser } from "@/shared/interfaces/iUser";
import NewEmployeeFormDropdown from "./NewEmployeeFormDropdown";
import NewEmployeeFormGroups from "./NewEmployeeFormGroups";
import NewEmployeeLabelField from "./NewEmployeeLabelField";
import NewEmployeeTextField from "./NewEmployeeTextField";
import {
  optionalEmployeeId,
  useOrgLevels,
  useOrgSublevels,
} from "./newEmployeeForm.hooks";
import { TooltipHost } from "@fluentui/react";
import { useRefresh } from "@/shared/hooks/useRefresh";
import { useTranslation } from "react-i18next";

interface INewEmployeeFormFields {
  addToSharepoint: boolean;
  addToAzure: boolean;
  addToLocalAd: boolean;
  manager?: IUser;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  fieldErrors: FieldErrors<any>;
  register: UseFormRegister<any>;
  reset: (values?: any) => void;
  setEmployeeId: Dispatch<React.SetStateAction<string | undefined>>;
  setFirstName: Dispatch<React.SetStateAction<string | undefined>>;
  setLastName: Dispatch<React.SetStateAction<string | undefined>>;
  setDisplayName: Dispatch<React.SetStateAction<string | undefined>>;
}
const NewEmployeeFormFields = (props: INewEmployeeFormFields) => {
  const { orgLevels, uniqueOrgUnits } = useOrgLevels();
  const { t } = useTranslation();
  const refGroups = useRef<IDropdown>(null); // Reserved to getting access to selected items on the upper level
  const refOrgUnit = useRef<IDropdown>(null);
  const refOrgDepartment = useRef<IDropdown>(null);
  const refOrgTeam = useRef<IDropdown>(null);
  const uniqueOrgDepartments = useOrgSublevels(
    orgLevels,
    refOrgUnit.current?.selectedOptions?.length
      ? refOrgUnit.current?.selectedOptions[0].text
      : undefined,
    "orgUnit",
    "orgDepartment"
  );
  let uniqueOrgTeams = useOrgSublevels(
    orgLevels,
    refOrgDepartment.current?.selectedOptions?.length
      ? refOrgDepartment.current?.selectedOptions[0].text
      : undefined,
    "orgDepartment",
    "orgTeam"
  );
  const refresh = useRefresh();
  if (
    refOrgDepartment.current?.selectedOptions?.length &&
    !uniqueOrgDepartments.some(
      (d) => d === refOrgDepartment.current?.selectedOptions[0].text
    )
  ) {
    uniqueOrgTeams = [];
  }
  const requiredEmployeeId =
    props.employeeId !== optionalEmployeeId && props.addToSharepoint;

  return (
    <>
      <NewEmployeeLabelField
        name={FormFields.manager}
        title={t("userProp_manager")}
        value={props.manager?.displayName}
        waitForLoadingValue={true}
      />
      <input
        type="hidden"
        name={FormFields.managerUpn}
        value={props.manager?.userPrincipalName}
      />
      <NewEmployeeTextField
        name={FormFields.employeeId}
        title={t("userProp_employeeId")}
        required={requiredEmployeeId}
        textComment={t("proposed")}
        value={
          requiredEmployeeId && props.employeeId !== optionalEmployeeId
            ? props.employeeId
            : ""
        }
        waitForLoadingValue={requiredEmployeeId}
        register={props.register}
        fieldError={props.fieldErrors[FormFields.employeeId] as FieldError}
        button={
          requiredEmployeeId && props.addToSharepoint ? (
            <TooltipHost content={t("refresh")}>
              <FontIcon
                iconName={"Refresh"}
                className="-ml-5 mt-1 pr-[6px] cursor-pointer laptop:hidden"
                onClick={() => {
                  props.setEmployeeId(undefined);
                  props.reset({ employeeId: props.employeeId });
                }}
              />
            </TooltipHost>
          ) : (
            <></>
          )
        }
      />
      <NewEmployeeTextField
        name={FormFields.firstName}
        title={t("userProp_firstName")}
        required={true}
        textComment={t("required")}
        value={props.firstName}
        onChange={props.setFirstName}
        register={props.register}
        fieldError={props.fieldErrors[FormFields.firstName] as FieldError}
      />
      <NewEmployeeTextField
        name={FormFields.lastName}
        title={t("userProp_lastName")}
        required={true}
        textComment={t("required")}
        value={props.lastName}
        onChange={props.setLastName}
        register={props.register}
        fieldError={props.fieldErrors[FormFields.lastName] as FieldError}
      />
      <NewEmployeeTextField
        name={FormFields.displayName}
        title={t("userProp_displayName")}
        required={false}
        onChange={props.setDisplayName}
        placeholder={`${props.firstName ?? ""} ${props.lastName ?? ""}`}
        register={props.register}
      />
      <NewEmployeeTextField
        name={FormFields.jobTitle}
        title={t("userProp_jobTitle")}
        required={false}
        register={props.register}
      />
      <NewEmployeeTextField
        name={FormFields.mobilePhone}
        title={t("userProp_mobilePhone")}
        required={false}
        register={props.register}
        fieldError={props.fieldErrors[FormFields.mobilePhone] as FieldError}
      />
      <NewEmployeeTextField
        name={FormFields.workPhone}
        title={t("userProp_workPhone")}
        required={false}
        register={props.register}
        fieldError={props.fieldErrors[FormFields.workPhone] as FieldError}
      />
      {uniqueOrgUnits.length ? (
        <NewEmployeeFormDropdown
          formField={FormFields.orgUnit}
          title={t("userProp_orgUnitText")}
          values={uniqueOrgUnits}
          ref={refOrgUnit}
          refresh={refresh}
          register={props.register}
        />
      ) : null}
      {uniqueOrgDepartments.length ? (
        <NewEmployeeFormDropdown
          formField={FormFields.orgDepartment}
          title={t("userProp_departmentText")}
          values={uniqueOrgDepartments}
          ref={refOrgDepartment}
          refresh={refresh}
          register={props.register}
        />
      ) : null}
      {uniqueOrgDepartments.length && uniqueOrgTeams.length ? (
        <NewEmployeeFormDropdown
          formField={FormFields.orgTeam}
          title={t("userProp_teamText")}
          values={uniqueOrgTeams}
          ref={refOrgTeam}
          refresh={refresh}
          register={props.register}
        />
      ) : null}
      {props.addToAzure || props.addToLocalAd ? (
        <NewEmployeeFormGroups
          addToAzure={props.addToAzure}
          addToLocalAd={props.addToLocalAd}
          translations={t}
          ref={refGroups}
        />
      ) : null}
    </>
  );
};

export default NewEmployeeFormFields;
