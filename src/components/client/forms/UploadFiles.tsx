import { ChangeEvent, useState } from "react";
import ButtonActionStatus from "./ButtonActionStatus";
import { DefaultButton } from "@fluentui/react";
import { IFormState } from "@/shared/interfaces/iFormState";
import { initialState, isInitialState } from "./NewEmployeeForm";
import { IUploadFile } from "@/shared/interfaces/iUploadFile";
import { UploadFileList } from "./UploadFileList";
import { UploadFileType } from "@/components/enums/uploadFileType";
import { useTranslation } from "react-i18next";
import { useUploadFiles } from "./uploadFiles.hooks";

const UploadFiles = ({
  state,
  textKey,
  allowedFileType,
  allowedMultiple,
  canUploadFiles,
}: //refresh,
{
  state: IFormState;
  textKey: string;
  allowedFileType: UploadFileType;
  allowedMultiple: boolean;
  canUploadFiles?: boolean;
  //refresh: () => void;
}) => {
  const [uploaded, setUploaded] = useState<IUploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string>();
  const { t } = useTranslation();

  const refUpload = useUploadFiles({
    canUploadFiles,
    state,
    uploaded,
    setIsUploading,
    setUploadErrors,
    setUploaded,
  });

  const resetState = (state: IFormState) =>
    Object.keys(initialState).forEach(
      // @ts-ignore
      (key) => (state[key] = initialState[key])
    );

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const uploadingFiles = Array.from(e.target.files);
    Promise.all(
      uploadingFiles.map((file) => {
        return new Promise<IUploadFile>((resolve, reject) => {
          const fileName = file.name;
          const reader = new FileReader();
          reader.onerror = reject;
          reader.onload = async (event) => {
            if (!event.target?.result) {
              reject(`Error on uploading ${fileName} (empty content?)`);
              return;
            }
            try {
              const uploadedFile: IUploadFile = {
                content: event.target.result as ArrayBuffer,
                isImage: allowedFileType === UploadFileType.image,
                name: fileName,
              };
              resolve(uploadedFile);
            } catch (exc) {
              console.error(exc);
              reject(`Error on uploading ${fileName}`);
            }
          };
          reader.readAsArrayBuffer(file);
        });
      })
    )
      .then((results) => {
        const files: IUploadFile[] = allowedMultiple ? [...uploaded] : [];
        const merged = results.reduce((acc, newFile) => {
          const alreadyUploaded = acc.find(
            (file) => file.name === newFile.name
          );
          if (alreadyUploaded) {
            alreadyUploaded.content = newFile.content;
          } else {
            acc.push(newFile);
          }
          return acc;
        }, files);

        setUploaded(files);
        //setTimeout(refresh);
      })
      .catch((reason) => console.log(reason));
  };

  return (
    <>
      <div className="flex">
        <DefaultButton
          className="border-gray-400 rounded mb-2 w-60"
          onClick={() => refUpload.current?.click()}
          aria-disabled={isUploading}
          disabled={isUploading}
        >
          {t(textKey)}
        </DefaultButton>
        <ButtonActionStatus
          isInProgress={isUploading}
          showIcon={uploadErrors !== undefined && !isInitialState(state)}
          tooltip={uploadErrors ? uploadErrors : t("submitted")}
          iconName={!uploadErrors ? "CheckMark" : "Error"}
          hasErrors={!!uploadErrors}
        />
      </div>
      <UploadFileList
        isUploading={isUploading}
        uploaded={uploaded}
        setUploaded={setUploaded}
      />
      <input
        className="hidden"
        ref={refUpload}
        type="file"
        onChange={(e) => {
          if (!e.target.files?.length) return;
          handleUpload(e);
          resetState(state);
        }}
        accept={allowedFileType}
        multiple={allowedMultiple}
      />
    </>
  );
};
export default UploadFiles;
