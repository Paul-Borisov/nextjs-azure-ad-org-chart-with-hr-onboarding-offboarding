import { auth } from "@/auth";
import { addUserPhotoToDatabase } from "@/prisma/userPhotos.create";
import {
  cacheUseDatabase,
  canQueryPhoto,
  fetchUserPhotoFromMsGraph,
  //refreshDatabaseCache,
} from "../photo/[id]/utils";
import { getUserPhotosFromDatabase } from "@/prisma/userPhotos.get";
import { getUsersFromDatabase } from "@/prisma/users.get";
import { isMainThread, parentPort, Worker, workerData } from "worker_threads";
import { IUser } from "@/shared/interfaces/iUser";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
let isRunning: boolean = false;

export async function GET() {
  if (!(await canQueryPhoto())) {
    return new NextResponse(JSON.stringify([]), {
      status: 200,
    });
  }

  let refreshPhotosForUserIds: string[] = [];
  const allUsers = await getUsersFromDatabase();
  const photos = await getUserPhotosFromDatabase();
  //const expiredPhotos = await getUserPhotosFromDatabase(undefined, true);
  if (photos) {
    allUsers?.forEach((user: IUser) => {
      const userPhoto = photos[user.id];
      if (typeof userPhoto === "undefined") {
        if (cacheUseDatabase) {
          //refreshDatabaseCache(user.id); // This may block the main thread
          refreshPhotosForUserIds.push(user.id); // This is a non-blocking alternative
        }
        // const expiredUserPhoto = expiredPhotos?.[user.id];
        // if (expiredUserPhoto) photos[user.id] = expiredUserPhoto;
      }
    });
  }

  if (refreshPhotosForUserIds.length) {
    refreshPhotosInWorkerThread(refreshPhotosForUserIds);
  } else {
    //console.log("EXPIRED PHOTOS NOT FOUND");
  }

  return new NextResponse(JSON.stringify(photos), {
    status: 200,
  });
}

const refreshPhotosInWorkerThread = async (userIds: string[]) => {
  if (isMainThread && !isRunning && userIds.length) {
    const session = await auth();
    isRunning = true;
    const worker = new Worker(__filename, {
      workerData: {
        accessToken: session?.user.accessToken,
        userIds,
      },
    });

    worker.on("message", (result) => {
      //console.log("Result from longRunningTaskWorkerThread:", result);
      isRunning = false;
    });
    worker.on("exit", (exitCode) => {
      //console.error("Exit code from longRunningTaskWorkerThread:", exitCode);
      isRunning = false;
    });
  }
};

if (!isMainThread && workerData?.accessToken && workerData?.userIds) {
  const updatePhotosInWorkerThread = async () => {
    const userIds = workerData.userIds;
    const modified = new Date();
    const promises: Promise<any>[] = [];
    userIds.forEach((id: string) => {
      promises.push(
        fetchUserPhotoFromMsGraph(id, workerData.accessToken).then((b64) =>
          addUserPhotoToDatabase(id, b64, modified)
        )
      );
    });
    const a = await Promise.allSettled(promises);
    return "updatePhotosInWorkerThread completed";
  };

  updatePhotosInWorkerThread().then((result) =>
    parentPort?.postMessage(result)
  );
}
