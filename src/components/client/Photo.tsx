import Image from "next/image";
import { Initials } from "./Initials";
import { IUser } from "@/shared/interfaces/iUser";
import { ForwardedRef, forwardRef } from "react";
import { usePhoto } from "./photo.hooks";

const Photo = (
  {
    user,
    loadPhoto,
    width = 32,
    height = 32,
    existingRefPhoto,
  }: {
    user: IUser;
    loadPhoto?: boolean;
    width?: number;
    height?: number;
    existingRefPhoto?: ForwardedRef<HTMLImageElement>;
  },
  refPhoto: ForwardedRef<HTMLImageElement>
) => {
  const imageSource =
    usePhoto(user, loadPhoto, existingRefPhoto) ||
    sessionStorage.getItem(user.id);

  return (
    <div
      className={[
        "rounded",
        !imageSource ? "print:invisible" : undefined,
        user.isDirty
          ? "before:absolute before:-ml-4 before:mt-1 before:content-['*'] before:text-blue-300"
          : undefined,
      ].join(" ")}
      title={user.displayName}
    >
      {imageSource ? (
        <Image
          ref={refPhoto}
          src={`data:image/png;base64,${imageSource}`}
          width={width}
          height={height}
          alt={user.displayName}
          className="rounded-3xl mr-2"
          style={{ minWidth: width, minHeight: height }}
        ></Image>
      ) : (
        <Initials title={user.displayName} />
      )}
    </div>
  );
};

export default forwardRef(Photo);
