import Loading from "@/shared/components/Loading";
import { useTranslation } from "react-i18next";

interface INewEmployeeLabelField {
  name: string;
  title: string;
  textComment?: string;
  value?: string;
  waitForLoadingValue?: boolean;
}
const NewEmployeeLabelField = (props: INewEmployeeLabelField) => {
  const { t } = useTranslation();
  return (
    <>
      {props.waitForLoadingValue && !props.value ? (
        <Loading text={t("loadingData")} />
      ) : (
        <>
          <div className="text-lg font-semibold">{props.title}</div>
          <div className="text-nowrap overflow-x-hidden text-ellipsis w-60">
            {props.value}
          </div>
          <div className="italic pl-10 tablet:invisible">
            {props.textComment}
          </div>
          <input type="hidden" name={props.name} value={props.value ?? ""} />
        </>
      )}
    </>
  );
};

export default NewEmployeeLabelField;
