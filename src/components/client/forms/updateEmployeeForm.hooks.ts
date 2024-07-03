import {
  BaseSyntheticEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  FieldErrors,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { findEmployeeId } from "@/actions/sharepoint.get";
import { FormFields } from "@/shared/enums/formFields";
import {
  getUserByUserId,
  getUserByUserPrincipalName,
} from "@/actions/users.get";
import { IUser } from "@/shared/interfaces/iUser";
import { optionalEmployeeId } from "./newEmployeeForm.hooks";
import { useTranslation } from "react-i18next";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const useAzureAdAccount = (userPrincipalName: string | undefined) => {
  const [azureAdAccountExists, setAzureAdAccountExists] = useState<boolean>();
  useEffect(() => {
    if (!userPrincipalName) return;
    getUserByUserPrincipalName(userPrincipalName).then((result) =>
      setAzureAdAccountExists(!!result?.id)
    );
  }, [userPrincipalName]);

  if (!userPrincipalName) {
    return false;
  } else {
    return azureAdAccountExists;
  }
};

export const useFindEmployeeId = (
  isPanelOpen: boolean,
  isSharepointEnabled: boolean,
  user: IUser | undefined
): [
  string | undefined,
  string | undefined,
  listItemId: number | undefined,
  Dispatch<SetStateAction<string | undefined>>,
  Dispatch<SetStateAction<string | undefined>>
] => {
  const [employeeId, setEmployeeId] = useState<string>();
  const [initialEmployeeId, setInitialEmployeeId] = useState<string>();
  const [listItemId, setListItemId] = useState<number>();
  useEffect(() => {
    const ensureEmployeeIdForUser = (user: IUser) => {
      // Try to get employeeId from Entra ID
      getUserByUserId(user.userPrincipalName).then((result) => {
        const value = result?.employeeId ?? optionalEmployeeId;
        setEmployeeId(value);
        if (!initialEmployeeId) {
          setInitialEmployeeId(value);
        }
        setListItemId(undefined);
      });
    };
    if (isSharepointEnabled && user) {
      if (employeeId === undefined || employeeId === optionalEmployeeId) {
        // Try to get employeeId from SharePoint
        findEmployeeId(user.userPrincipalName, user.displayName).then(
          (result) => {
            if (!result?.listItemId) {
              ensureEmployeeIdForUser(user);
            } else {
              const value = result?.employeeId ?? optionalEmployeeId;
              setEmployeeId(value);
              if (!initialEmployeeId) {
                setInitialEmployeeId(value);
              }
              setListItemId(result?.listItemId);
            }
          }
        );
      }
    } else {
      if (!employeeId) {
        if (user) {
          ensureEmployeeIdForUser(user);
        } else {
          setEmployeeId(optionalEmployeeId);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, isPanelOpen, isSharepointEnabled]);

  return [
    employeeId,
    initialEmployeeId,
    listItemId,
    setEmployeeId,
    setInitialEmployeeId,
  ];
};

const useFormSchema = () => {
  const { t } = useTranslation();
  const numberError = t("form_employeeIdTypeError");
  const formSchema = z.object({
    [FormFields.employeeId]: z
      .string()
      .trim()
      .regex(/^\d{5,}$/, numberError),
  });

  return formSchema;
};

export const useUpdateEmployeeForm = ({
  setSubmittedData,
}: {
  setSubmittedData?: (value: any) => void;
}) => {
  const formSchema = useFormSchema();
  type ActiveFormFields = z.infer<typeof formSchema>;
  const {
    formState: { errors: fieldErrors, isValid: isFormValid },
    handleSubmit,
    getValues,
    register,
    reset,
  } = useForm<ActiveFormFields>({
    resolver: zodResolver(formSchema),
  });
  const onFormDataValid: SubmitHandler<ActiveFormFields> = (
    data: ActiveFormFields,
    e?: BaseSyntheticEvent
  ) => {
    if (setSubmittedData) setSubmittedData(getValues());
  };

  const onFormDataInvalid: SubmitErrorHandler<ActiveFormFields> = (
    data: FieldErrors<ActiveFormFields>
  ) => {};

  return {
    fieldErrors,
    isFormValid,
    handleSubmit,
    register,
    reset,
    onFormDataValid,
    onFormDataInvalid,
  };
};
