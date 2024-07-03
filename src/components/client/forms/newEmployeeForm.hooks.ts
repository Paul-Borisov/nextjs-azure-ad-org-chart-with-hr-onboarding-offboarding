import {
  BaseSyntheticEvent,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  FieldErrors,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { FormFields } from "@/shared/enums/formFields";
import {
  //getNewEmployeeId,
  getNewEmployeeIdForManager,
  getSiteUserId,
} from "@/actions/sharepoint.get";
import { IOrgUnit } from "@/shared/interfaces/iOrgUnit";
import { PanelContext } from "@/components/contexts/panelContext";
import UserUtils from "@/shared/lib/userUtils";
import { useTranslation } from "react-i18next";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const optionalEmployeeId = "-1";

export const useFormSchema = (employeeId?: string) => {
  const { t } = useTranslation();
  const numberError = t("form_employeeIdTypeError");
  const phoneFormatError = t("form_phoneFormatError");
  const requiredError = t("form_requiredField");
  const isOptionalEmployeeId = employeeId === optionalEmployeeId;
  const formSchema = z.object({
    [FormFields.employeeId]: z
      .string()
      .trim()
      .min(!isOptionalEmployeeId ? 1 : 0, requiredError)
      .regex(!isOptionalEmployeeId ? /^\d{5,}$/ : /^\d{0,}$/, numberError),
    [FormFields.firstName]: z.string().trim().min(1, requiredError),
    [FormFields.lastName]: z.string().trim().min(1, requiredError),
    [FormFields.displayName]: z.string(),
    [FormFields.mobilePhone]: z
      .string()
      .trim()
      .regex(/^\+?\d{5,25}$|^$/, phoneFormatError),
    [FormFields.workPhone]: z
      .string()
      .trim()
      .regex(/^\+?\d{5,25}$|^$/, phoneFormatError),
    [FormFields.orgUnit]: z.string().optional(),
    [FormFields.orgDepartment]: z.string().optional(),
    [FormFields.orgTeam]: z.string().optional(),
  });

  return formSchema;
};

export const useNewEmployeeId = (
  isPanelOpen: boolean,
  isSharepointEnabled: boolean,
  managerUpn: string
): [
  string | undefined,
  isValidSiteUserForManager: boolean,
  Dispatch<SetStateAction<string | undefined>>
] => {
  const [employeeId, setEmployeeId] = useState<string>();
  const [isValidSiteUserForManager, setIsValidSiteUserForManager] =
    useState(false);

  useEffect(() => {
    if (isSharepointEnabled) {
      if (!employeeId || employeeId === optionalEmployeeId) {
        getNewEmployeeIdForManager(managerUpn).then((results) => {
          const newEmployeeId = results?.employeeId;
          const managerExists = !!results?.managerSiteUserId;
          setEmployeeId(
            managerExists && newEmployeeId ? newEmployeeId : optionalEmployeeId
          );
          setIsValidSiteUserForManager(managerExists);
        });
        /*getNewEmployeeId().then((newEmployeeId) =>
          getSiteUserId(managerUpn).then((siteUserId) => {
            setEmployeeId(siteUserId ? newEmployeeId : optionalEmployeeId);
            setIsValidSiteUserForManager(!!siteUserId);
          })
        );*/
      }
    } else {
      setEmployeeId(optionalEmployeeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, isPanelOpen, isSharepointEnabled]);

  return [employeeId, isValidSiteUserForManager, setEmployeeId];
};

export const useNewEmployeeForm = ({
  addToSharepoint,
  employeeId,
  setEmployeeId,
  setSubmittedData,
}: {
  addToSharepoint: boolean;
  employeeId?: string;
  setEmployeeId: (value: string | undefined) => void;
  setSubmittedData?: (value: any) => void;
}) => {
  const formSchema = useFormSchema(
    addToSharepoint ? employeeId : optionalEmployeeId
  );
  type ActiveFormFields = z.infer<typeof formSchema>;

  const {
    formState: { errors: fieldErrors, isValid: isFormValid },
    handleSubmit,
    getValues,
    register,
    reset,
    setValue,
  } = useForm<ActiveFormFields>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (addToSharepoint) {
      reset({ employeeId: undefined });
      setEmployeeId(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToSharepoint]);

  const onFormDataValid: SubmitHandler<ActiveFormFields> = (
    data: ActiveFormFields,
    e?: BaseSyntheticEvent
  ) => {
    if (setSubmittedData) setSubmittedData(getValues());
  };

  const onFormDataInvalid: SubmitErrorHandler<ActiveFormFields> = (
    data: FieldErrors<ActiveFormFields>
  ) => {
    //console.log(data);
  };

  return {
    fieldErrors,
    isFormValid,
    handleSubmit,
    getValues,
    register,
    reset,
    setValue,
    onFormDataValid,
    onFormDataInvalid,
  };
};

export const useOrgLevels = () => {
  const { data: users } = useContext(PanelContext);
  const [orgLevels, setOrgLevels] = useState<IOrgUnit[]>([]);
  const [uniqueOrgUnits, setUniqueOrgUnits] = useState<string[]>([]);

  useEffect(() => {
    if (orgLevels.length) return;
    const uniqueUnits = UserUtils.extractOrgUnits(users);
    setOrgLevels(uniqueUnits.extracted);
    setUniqueOrgUnits(uniqueUnits.uniqueOrgUnits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { orgLevels, uniqueOrgUnits };
};

export const useOrgSublevels = (
  orgUnits: IOrgUnit[],
  selectedLevelName: string | undefined,
  parentLevelName: "orgUnit" | "orgDepartment",
  childLevelName: "orgDepartment" | "orgTeam"
) => {
  if (!orgUnits.length || !selectedLevelName) return [];
  return Array.from(
    new Set(
      orgUnits
        .filter(
          (ou) =>
            !!selectedLevelName &&
            ou[parentLevelName]?.toLocaleLowerCase() ===
              selectedLevelName?.toLocaleLowerCase() &&
            !!ou[childLevelName]
        )
        .map((ou) => ou[childLevelName] || "")
    )
  ).toSorted();
};

export const useSharepointSiteUser = (
  isSharepointEnabled: boolean,
  userPrincipalName: string
): boolean => {
  const [isValidSiteUser, setIsValidSiteUser] = useState(false);

  useEffect(() => {
    if (isSharepointEnabled) {
      getSiteUserId(userPrincipalName).then((siteUserId) => {
        setIsValidSiteUser(!!siteUserId);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSharepointEnabled]);

  return isValidSiteUser;
};
