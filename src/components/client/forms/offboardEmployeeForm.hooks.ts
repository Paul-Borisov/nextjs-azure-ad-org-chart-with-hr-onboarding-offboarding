import { BaseSyntheticEvent } from "react";
import {
  FieldErrors,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const useFormSchema = () => {
  const formSchema = z.object({});
  return formSchema;
};

export const useOffboardEmployeeForm = () => {
  const formSchema = useFormSchema();
  type ActiveFormFields = z.infer<typeof formSchema>;
  const {
    formState: { errors: fieldErrors, isValid: isFormValid },
    handleSubmit,
    register,
    reset,
  } = useForm<ActiveFormFields>({
    resolver: zodResolver(formSchema),
  });
  const onFormDataValid: SubmitHandler<ActiveFormFields> = (
    data: ActiveFormFields,
    e?: BaseSyntheticEvent
  ) => {};

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
