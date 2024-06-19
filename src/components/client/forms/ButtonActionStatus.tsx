import { FontIcon, TooltipHost } from "@fluentui/react";
import Loading from "@/shared/components/Loading";

interface IUploadStatus {
  isInProgress: boolean;
  iconName: string;
  hasErrors: boolean;
  showIcon: boolean;
  tooltip?: string;
}
const ButtonActionStatus = (props: IUploadStatus) => {
  return (
    <>
      {props.isInProgress ? (
        <div className="ml-4">
          <Loading />
        </div>
      ) : null}
      {props.isInProgress || !props.showIcon ? null : (
        <div className="ml-4 -mt-4">
          <TooltipHost content={props.tooltip}>
            <FontIcon
              iconName={props.iconName}
              className={[
                !props.hasErrors
                  ? "text-green-600 pt-3 block text-3xl" // clsx merging does not work well here
                  : "text-red-400 pt-3 block text-3xl",
              ]
                .join(" ")
                .trim()}
            />
          </TooltipHost>
        </div>
      )}
    </>
  );
};

export default ButtonActionStatus;
