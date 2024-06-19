"use client";

import { IFormState } from "@/shared/interfaces/iFormState";
import { ILocalizableClient } from "@/shared/interfaces/iLocalizable";
import { isInitialState } from "./NewEmployeeForm";
import { PanelContext } from "@/components/contexts/panelContext";
import React, { useContext } from "react";
import SendMail from "./SendMail";
import SubmitButton from "./SubmitButton";
import UploadFiles from "./UploadFiles";
import { UploadFileType } from "@/components/enums/uploadFileType";

const NewEmployeeFormButtons = ({
  addToAzure,
  addToLocalAd,
  addToSharepoint,
  state,
  submittedData,
  translations: t,
  cleanup,
}: {
  addToAzure: boolean;
  addToLocalAd: boolean;
  addToSharepoint: boolean;
  state: IFormState;
  submittedData: any;
  cleanup: () => void;
} & ILocalizableClient) => {
  const {
    manager,
    canAddToSharepointLibrary,
    canAddToSharepointList,
    canManageAzureAccounts,
  } = useContext(PanelContext);

  const canUploadFiles =
    canAddToSharepointList && canAddToSharepointLibrary && addToSharepoint;
  const canUploadPhoto =
    canUploadFiles || (canManageAzureAccounts && (addToAzure || addToLocalAd));

  return (
    <>
      <div
        className={[
          "pt-8 col-span-3",
          !canUploadFiles ? "invisible" : undefined,
        ]
          .join(" ")
          .trim()}
      >
        <UploadFiles
          state={state}
          textKey="uploadDocuments"
          allowedFileType={UploadFileType.document}
          allowedMultiple={true}
          canUploadFiles={canUploadFiles}
        />
      </div>
      <div
        className={[
          "pt-3 col-span-3",
          !canUploadPhoto ? "invisible" : undefined,
        ]
          .join(" ")
          .trim()}
      >
        <UploadFiles
          state={state}
          textKey="uploadPhoto"
          allowedFileType={UploadFileType.image}
          allowedMultiple={false}
          canUploadFiles={canUploadPhoto}
        />
      </div>
      <div
        className={[
          "pt-10 col-span-1",
          !state.error && !isInitialState(state) && submittedData
            ? undefined
            : "invisible",
        ]
          .join(" ")
          .trim()}
      >
        <SendMail
          manager={manager!}
          state={state}
          submittedData={submittedData}
          translations={t}
        />
      </div>
      {/*Placeholder*/}
      <div />
      <div className="flex pt-10 pl-10 tablet:pl-0">
        <SubmitButton
          state={state as any}
          translations={t}
          cleanup={cleanup}
          hasAllowedActions={
            (canManageAzureAccounts && (addToAzure || addToLocalAd)) ||
            (canAddToSharepointList && addToSharepoint)
          }
        />
      </div>
    </>
  );
};

export default NewEmployeeFormButtons;
