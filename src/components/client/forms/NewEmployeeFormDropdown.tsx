import { Dropdown, IDropdown, IRefObject, values } from "@fluentui/react";
import { FormFields } from "@/shared/enums/formFields";
import { forwardRef, ForwardedRef, useState } from "react";
import { UseFormRegister } from "react-hook-form";

const NewEmployeeFormDropdown = (
  props: {
    title: string;
    values: string[];
    formField?: FormFields;
    multiSelect?: boolean;
    refresh?: () => void;
    register: UseFormRegister<any>;
  },
  ref: ForwardedRef<IDropdown>
) => {
  const [selectedKey, setSelectedKey] = useState<string | number | undefined>(
    ""
  );
  const refDropdown = ref as IRefObject<IDropdown>;

  const titleRenderer = <T,>(
    selectedItems?: T[],
    defaultRender?: (props?: T[]) => JSX.Element | null
  ): JSX.Element | null => {
    return (
      <>
        {defaultRender ? defaultRender(selectedItems) : <></>}
        {props.formField ? (
          <input
            type="hidden"
            {...props.register(props.formField)}
            value={selectedItems?.map((item: any) => item?.text)}
          />
        ) : null}
      </>
    );
  };

  return (
    <>
      <div className="text-lg font-semibold">{props.title}</div>
      <div className="col-span-2">
        {props.values?.length ? (
          <Dropdown
            className="!w-60"
            multiSelect={props.multiSelect}
            options={["", ...props.values].map((value, index) => ({
              key: `${value}_${index}`,
              text: value,
            }))}
            componentRef={refDropdown}
            onRenderTitle={titleRenderer}
            onChange={(_, option) => {
              setSelectedKey(option?.key);
              if (props.refresh) props.refresh();
            }}
            defaultSelectedKey={selectedKey}
          />
        ) : null}
      </div>
    </>
  );
};

export default forwardRef(NewEmployeeFormDropdown);
