import { DefaultButton } from "@fluentui/react";
import { IFormState } from "@/shared/interfaces/iFormState";
import { ITranslationResource } from "@/shared/interfaces/iTranslationResource";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import ButtonActionStatus from "./ButtonActionStatus";

interface ISubmitButton {
  className?: string;
  state: IFormState;
  cleanup: () => void;
  translations: ITranslationResource;
  hasAllowedActions?: boolean;
  isFormValid?: boolean;
}
const SubmitButton = ({
  className = "border-gray-400 rounded text-nowrap",
  state,
  cleanup,
  translations: t,
  hasAllowedActions,
  isFormValid,
}: ISubmitButton) => {
  const { pending: isSubmitting } = useFormStatus();
  const [clearStatusIcon, setClearStatusIcon] = useState(false);

  const isFormSubmissionSucceeded =
    !isSubmitting && state.message && !state.error;

  useEffect(() => {
    if (isFormSubmissionSucceeded && cleanup) {
      setClearStatusIcon(false);
      cleanup();
    }
  }, [isSubmitting, state.error, isFormSubmissionSucceeded, cleanup]);

  const getTooltip = () => {
    const translationKey = state.message?.toLowerCase() ?? "";
    let tooltip = t(translationKey);
    if (tooltip === translationKey) tooltip = state.message;
    return tooltip;
  };

  return (
    <>
      <DefaultButton
        type="submit"
        text={t("submit")}
        aria-disabled={
          (isFormValid !== undefined && !isFormValid) || isSubmitting
        }
        disabled={(isFormValid !== undefined && !isFormValid) || isSubmitting}
        className={[className, !hasAllowedActions ? "invisible" : undefined]
          .join(" ")
          .trim()}
        onClick={() => setClearStatusIcon(true)}
      />
      <ButtonActionStatus
        isInProgress={isSubmitting}
        showIcon={state.error || (!clearStatusIcon && !!state.message)}
        tooltip={getTooltip()}
        iconName={!state.error ? "CheckMark" : "Error"}
        hasErrors={state.error}
      />
    </>
  );
};

export default SubmitButton;
