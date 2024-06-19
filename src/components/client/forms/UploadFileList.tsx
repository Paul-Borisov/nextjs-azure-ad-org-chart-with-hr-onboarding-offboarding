import { Cross2Icon } from "@radix-ui/react-icons";
import Image from "next/image";
import { IUploadFile } from "@/shared/interfaces/iUploadFile";
import { FormFields } from "@/shared/enums/formFields";

export const UploadFileList = ({
  isUploading,
  uploaded,
  setUploaded,
}: {
  isUploading: boolean;
  uploaded: IUploadFile[];
  setUploaded: (value: IUploadFile[]) => void;
}) => {
  const arrayBufferToDataUrl = (buffer: ArrayBuffer) => {
    // @ts-ignore
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  };
  return (
    <div className="max-h-40 tablet:max-h-32 overflow-y-auto overflow-x-hidden">
      {uploaded?.map((entry, index) => (
        <div
          key={entry.name + index}
          className="grid grid-cols-3 gap-4 w-[25vw] tablet:w-[85vw]"
        >
          <span className="col-span-2 max-w-80 text-ellipsis text-nowrap">
            {!entry.isImage ? (
              entry.name
            ) : (
              <>
                <Image
                  alt={entry.name}
                  className="rounded-3xl"
                  height={48}
                  src={`data:image/png;base64,${arrayBufferToDataUrl(
                    entry.content
                  )}`}
                  width={48}
                />
                <input
                  type="hidden"
                  name={FormFields.userPhoto}
                  value={arrayBufferToDataUrl(entry.content)}
                />
              </>
            )}
          </span>
          <button
            className="w-[25px] h-[25px] pl-10"
            aria-label="Close"
            onClick={() =>
              setUploaded(uploaded.filter((_, ind) => ind !== index))
            }
            disabled={isUploading}
          >
            <Cross2Icon />
          </button>
        </div>
      ))}
    </div>
  );
};
