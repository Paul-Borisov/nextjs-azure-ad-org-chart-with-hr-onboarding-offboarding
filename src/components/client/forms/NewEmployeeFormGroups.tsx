import { Dropdown, IDropdown, IRefObject } from "@fluentui/react";
import { FormFields } from "@/shared/enums/formFields";
import { ILocalizableClient } from "@/shared/interfaces/iLocalizable";
import Loading from "@/shared/components/Loading";
import { forwardRef, ForwardedRef } from "react";
import { useAzureGroups } from "./newEmployeeFormGroups.hooks";

const NewEmployeeFormGroups = (
  props: {
    addToAzure: boolean;
    addToLocalAd: boolean;
  } & ILocalizableClient,
  ref: ForwardedRef<IDropdown>
) => {
  const { options } = useAzureGroups(props);
  const t = props.translations;
  const refGroups = ref as IRefObject<IDropdown>;

  const titleRenderer = <T,>(
    selectedItems?: T[],
    defaultRender?: (props?: T[]) => JSX.Element | null
  ): JSX.Element | null => {
    return (
      <>
        {defaultRender ? defaultRender(selectedItems) : <></>}
        <input
          type="hidden"
          name={FormFields.selectedGroups}
          value={selectedItems?.map((item: any) => item?.key)}
        />
      </>
    );
  };

  return (
    <>
      <div className="text-lg font-semibold">{t("addToGroups")}</div>
      <div className="col-span-2">
        {options?.length ? (
          <Dropdown
            className="!w-60"
            multiSelect={true}
            options={options}
            componentRef={refGroups}
            onRenderTitle={titleRenderer}
          />
        ) : (
          <Loading text={t("loadingData")} />
        )}
      </div>
    </>
  );
};

export default forwardRef(NewEmployeeFormGroups);
