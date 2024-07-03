import { Dispatch, SetStateAction, createRef, useEffect } from "react";
import { FormFields } from "@/shared/enums/formFields";
import { IFormState } from "@/shared/interfaces/iFormState";
import { IUploadFile } from "@/shared/interfaces/iUploadFile";
import { uploadFiles } from "@/actions/sharepoint.upload";

interface IUploadFiles {
  canUploadFiles?: boolean;
  state: IFormState;
  uploaded: IUploadFile[];
  setIsUploading: Dispatch<SetStateAction<boolean>>;
  setUploadErrors: Dispatch<SetStateAction<string | undefined>>;
  setUploaded: Dispatch<SetStateAction<IUploadFile[]>>;
}
export const useUploadFiles = (props: IUploadFiles) => {
  const refUpload = createRef<HTMLInputElement>();

  useEffect(() => {
    if (refUpload.current) refUpload.current.value = "";
  }, [props.uploaded?.length, refUpload]);

  useEffect(() => {
    if (
      props.state.error ||
      !props.state.message ||
      !props.uploaded.length ||
      !props.canUploadFiles
    ) {
      return;
    }

    const getImageFileName = (fileName: string) => {
      const fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
      return `${FormFields.userPhoto}-${userPrincipalName}.${
        fileExtension ? fileExtension : "jpg"
      }`.toLocaleLowerCase();
    };
    const uploadSelectedFiles = (
      listItemId: string,
      userPrincipalName?: string
    ) => {
      props.setIsUploading(true);
      const formData = new FormData();
      props.uploaded.forEach((file) =>
        formData.append(
          !file.isImage ? file.name : getImageFileName(file.name),
          new Blob([file.content])
        )
      );
      formData.append(FormFields.userPrincipalName, userPrincipalName || "");
      // Upload files to SharePoint document library
      formData.append(FormFields.listItemId, listItemId);

      const all: Promise<any>[] = [];
      if (listItemId) all.push(uploadFiles(formData));
      Promise.all(all).then((results) => {
        props.setIsUploading(false);
        let errorMessages: string[] = [];
        results.forEach((result) => {
          if (result.error) {
            errorMessages.push(`${result.message}`);
          }
        });
        if (errorMessages.length) {
          props.setUploadErrors(errorMessages.join("\n"));
        } else {
          props.setUploaded([]);
          props.setUploadErrors("");
          if (refUpload.current) refUpload.current.value = "";
        }
      });
    };

    const listItemId = props.state.listItemId;
    const userPrincipalName = props.state.newUserPrincipalName;
    setTimeout(
      () =>
        uploadSelectedFiles(
          listItemId?.toString() as string,
          userPrincipalName
        ),
      2000
    ); // Starts soon after the refresh of employeeId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.canUploadFiles,
    props.state.message,
    props.state.listItemId,
    props.state.error,
    props.uploaded.length,
  ]);

  return refUpload;
};
