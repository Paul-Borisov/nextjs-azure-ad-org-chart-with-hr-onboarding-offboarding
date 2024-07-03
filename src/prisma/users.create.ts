import { FormFields } from "@/shared/enums/formFields";
import { getMaxCacheTimestamp } from "@/prisma/users.get";
import { IUser } from "@/shared/interfaces/iUser";
import { Prisma } from "@prisma/client";
import prisma from "@/prisma/clientSingleton";

export const addUsersToDatabase = async (users: IUser[]) => {
  const modified = new Date().toISOString();
  const data = users.map((user) => {
    const row: Prisma.usersCreateManyInput = {
      id: user.id,
      properties: JSON.stringify(user),
      modified: modified,
      isNew: !!user.isDirty,
    };
    return row;
  });
  return prisma
    .$transaction(
      [
        prisma.users.deleteMany({
          where: {
            modified: {
              lte: getMaxCacheTimestamp(),
            },
            isNew: false,
          },
        }),
        prisma.users.createMany({ data }),
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    )
    .then(async () => {
      // reserved
      return true;
    })
    .catch(async (e) => {
      console.error(e);
      return false;
    });
  //.finally(async () => await prisma.$disconnect());
};

export const addUserToDatabase = async (user: IUser) => {
  const modified = new Date().toISOString();
  const data: Prisma.usersCreateInput = {
    id: user.id,
    properties: JSON.stringify(user),
    modified: modified,
    isNew: !!user.isDirty,
  };
  prisma
    .$transaction(
      [
        prisma.users.deleteMany({
          where: {
            properties: {
              contains: `"${FormFields.userPrincipalName}":"${user.userPrincipalName}"`,
            },
          },
        }),
        prisma.users.create({ data }),
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    )
    .then(async () => {
      // reserved
    })
    .catch(async (e) => {
      console.error(e);
    });
  //.finally(async () => await prisma.$disconnect());
};

export const removeUserFromDatabase = async (userId: string) => {
  const found = await prisma.users.findFirst({
    where: {
      id: userId,
    },
  });
  if (!found) return;

  try {
    // Try to delete subordinates to eliminate orphans
    const foundUser = JSON.parse(found.properties) as IUser;
    await prisma.users
      .deleteMany({
        where: {
          properties: {
            contains: `"managerUpn":"${foundUser.userPrincipalName}"`,
          },
        },
      })
      .then(async () => {
        // reserved
      })
      .catch(async (e) => {
        console.error(e);
      });
  } catch (e) {
    console.log(e);
  }

  return prisma.users
    .deleteMany({
      where: {
        id: userId,
      },
    })
    .then(async () => {
      // reserved
      return true;
    })
    .catch(async (e) => {
      console.error(e);
      return false;
    });
  //.finally(async () => await prisma.$disconnect());
};
