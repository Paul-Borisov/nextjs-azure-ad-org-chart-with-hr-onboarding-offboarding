import { addUserPhotoToDatabase } from "@/prisma/userPhotos.create";
import { getPhotoUncached } from "@/app/api/photo/[id]/utils";
import { getUserPhotosFromDatabase } from "@/prisma/userPhotos.get";
import { IUser } from "@/shared/interfaces/iUser";

interface IUserPhotos {
  allUsers: IUser[] | undefined;
  cacheUseDatabase: boolean;
  renderUserPhotoOnClient: boolean;
  renderUserPhotoOnServer: boolean;
}

export const ensureUserPhotos = async (props: IUserPhotos) => {
  if (!props.renderUserPhotoOnClient && props.renderUserPhotoOnServer) {
    if (!props.cacheUseDatabase) {
      const promises: Promise<{ [key: string]: string | undefined }>[] = [];
      props.allUsers?.forEach((u) => {
        promises.push(getPhotoUncached(u.id).then((url) => ({ [u.id]: url })));
      });
      const allPhotos = await Promise.all(promises);
      const hashed = allPhotos.reduce((acc, v, {}) => ({ ...acc, ...v }));
      props.allUsers?.forEach((u) => (u.photo = hashed[u.id]));
    } else {
      const userPhotos = await getUserPhotosFromDatabase();
      const userPhotosExpired = await getUserPhotosFromDatabase(
        undefined,
        true
      );
      const modified = new Date();
      props.allUsers?.forEach(async (u) => {
        const photo = userPhotos?.[u.id];
        if (typeof photo === "undefined") {
          u.photo = userPhotosExpired?.[u.id] ?? undefined;
          getPhotoUncached(u.id)
            .then((url) => {
              addUserPhotoToDatabase(u.id, url, modified);
            })
            .catch((e) => {
              addUserPhotoToDatabase(u.id, undefined, modified);
            });
        } else {
          u.photo = photo ?? undefined;
        }
      });
    }
  }
};
