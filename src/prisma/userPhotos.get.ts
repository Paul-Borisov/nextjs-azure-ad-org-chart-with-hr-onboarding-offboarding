import { EnvSettings } from "@/shared/lib/envSettings";
import prisma from "@/prisma/clientSingleton";

export const getMaxCacheTimestampForUserPhotos = () => {
  const cacheExpirationTime = new Date();
  if (EnvSettings.cacheTimeoutMultiplierForPhoto === 0) {
    // Ignore database cache timestamps (never expired)
    cacheExpirationTime.setFullYear(cacheExpirationTime.getFullYear() - 100);
  } else {
    cacheExpirationTime.setSeconds(
      cacheExpirationTime.getSeconds() -
        EnvSettings.cacheTimeoutInSeconds *
          (EnvSettings.cacheTimeoutMultiplierForPhoto > 0
            ? EnvSettings.cacheTimeoutMultiplierForPhoto
            : 1)
    );
  }
  return cacheExpirationTime;
};

export const doesUserHavePhotoInDatabase = async (
  userId: string,
  modified: Date = getMaxCacheTimestampForUserPhotos(),
  expired: boolean = false
) => {
  const hasPhoto = prisma.userPhotos
    .count({
      where: {
        id: userId,
        modified: !expired
          ? {
              gt: modified,
            }
          : {
              lte: modified,
            },
      },
    })
    .then(async (count) => count > 0)
    .catch(async (e) => {
      console.log(e);
      return false;
    });
  //.finally(async () => await prisma.$disconnect());

  return hasPhoto;
};

export const getUserPhotosFromDatabase = async (
  modified: Date = getMaxCacheTimestampForUserPhotos(),
  expired: boolean = false
) => {
  return prisma.userPhotos
    .findMany({
      select: { id: true, photo: true },
      where: {
        modified: !expired
          ? {
              gt: modified,
            }
          : {
              lte: modified,
            },
      },
    })
    .then(async (data) => {
      const userPhotos: { [id: string]: string | null } = {};
      data.forEach(
        (row) => (userPhotos[row.id] = row.photo ? row.photo : null)
      );
      return userPhotos;
    })
    .catch(async (e) => {
      console.log(e);
      return undefined;
    });
  //.finally(async () => await prisma.$disconnect());
};

export const getUserPhotoFromDatabase = async (
  userId: string,
  modified: Date = getMaxCacheTimestampForUserPhotos(),
  expired: boolean = false
) => {
  const photo = prisma.userPhotos
    .findFirst({
      select: { photo: true },
      where: {
        id: userId,
        modified: !expired
          ? {
              gt: modified,
            }
          : {
              lte: modified,
            },
      },
    })
    .then(async (data) => (data?.photo ? data.photo : undefined))
    .catch(async (e) => {
      console.log(e);
      return undefined;
    });
  //.finally(async () => await prisma.$disconnect());

  return photo;
};
