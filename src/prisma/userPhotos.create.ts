import { Prisma } from "@prisma/client";
import prisma from "@/prisma/clientSingleton";

export const addUserPhotoToDatabase = async (
  userId: string,
  photo: string | undefined,
  modified: Date
) => {
  const newUserPhoto: Prisma.userPhotosCreateInput = {
    id: userId,
    photo: photo,
    modified: modified.toISOString(),
  };
  const updateUserPhoto: Prisma.userPhotosUpdateInput = {
    photo: photo,
    modified: modified.toISOString(),
  };
  const handleSuccess = () => ({ error: undefined, message: "OK" });
  const handleError = (e: any) => ({ error: e, message: e.message });

  return prisma.userPhotos
    .findUnique({
      where: {
        id: userId,
      },
    })
    .then((found) => {
      if (found) {
        return prisma.userPhotos
          .update({
            where: { id: userId },
            data: updateUserPhoto,
          })
          .then(() => handleSuccess())
          .catch(async (e) => handleError(e));
      } else {
        return prisma.userPhotos
          .create({ data: newUserPhoto })
          .then(() => handleSuccess())
          .catch(async (e) => handleError(e));
      }
    })
    .catch(async (e) => handleError(e));
  /*return prisma.userPhotos
    .deleteMany({
      where: {
        id: userId,
      },
    })
    .finally(() => prisma.userPhotos.create({ data: newUserPhoto }))
    .then(async () => {
      return { error: undefined, message: "OK" };
    })
    .catch(async (e) => {
      console.error(e);
      return { error: e, message: e.message };
    });*/
  //.finally(async () => await prisma.$disconnect());
};
