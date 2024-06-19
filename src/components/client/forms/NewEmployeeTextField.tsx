import Loading from "@/shared/components/Loading";
import { useDebounced } from "@/shared/hooks/useDebounced";
import { useTranslation } from "react-i18next";
import { FieldError, UseFormRegister } from "react-hook-form";

interface INewEmployeeTextField {
  name: string;
  title: string;
  placeholder?: string;
  required?: boolean;
  textComment?: string;
  value?: string;
  waitForLoadingValue?: boolean;
  onChange?: (value: string) => void;
  register: UseFormRegister<any>;
  fieldError?: FieldError;
  button?: JSX.Element;
}
const NewEmployeeTextField = (props: INewEmployeeTextField) => {
  const { t } = useTranslation();
  const debounced = useDebounced(
    (value) => (props.onChange ? props.onChange(value) : undefined),
    1000
  );
  return (
    <>
      <div className="text-lg font-semibold">
        {props.title}
        {props.required ? <span className="text-red-400 pl-2">*</span> : null}
      </div>
      <div>
        {props.waitForLoadingValue && !props.value ? (
          <Loading text={t("loadingData")} />
        ) : (
          <>
            {props.button ?? null}
            <input
              className="border border-gray-400 h-8 w-60 p-2 bg-transparent outline-none rounded"
              type="text"
              {...props.register(props.name)}
              autoComplete="off"
              //name={props.name} // Set by "register"
              defaultValue={props.value}
              onChange={(e) =>
                props.onChange
                  ? debounced((e.target as HTMLInputElement).value)
                  : undefined
              }
              placeholder={props.placeholder}
            />
            {props.fieldError ? (
              <div className="text-red-500">{props.fieldError.message}</div>
            ) : null}
          </>
        )}
      </div>
      <div className="italic pl-10">
        <span className="tablet:invisible medium:invisible">
          {props.textComment}
        </span>
      </div>
    </>
  );
};

export default NewEmployeeTextField;
