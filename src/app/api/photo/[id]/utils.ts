import { auth } from "@/auth";
import { addUserPhotoToDatabase } from "@/prisma/userPhotos.create";
import { settings } from "@/shared/enums/settings";
import Utils from "@/shared/lib/utils";

export const cacheUseDatabase = Utils.getBoolSetting(settings.cacheUseDatabase);

export const canQueryPhoto = async () => {
  const session = await auth();
  return session && !Utils.isGoogle(session.user.email);
};

export const fetchUserPhotoFromMsGraph = (
  userId: string,
  accessToken: string,
  callback?: (imageUrl: string | undefined) => void
) => {
  const endpoint = `https://graph.microsoft.com/v1.0/users/${userId}/photos/48x48/$value`;
  return fetch(endpoint, {
    method: "GET",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "Content-Type": "image/jpeg",
    },
  })
    .then((r) => {
      if (r.ok) {
        return r.arrayBuffer();
      } else {
        return undefined;
      }
    })
    .then((result) => {
      const imageUrl = result ? Buffer.from(result).toString("base64") : result;
      // There is an unclear bug related to potential memory leak in MS Graph or Next.js.
      // Sometimes requests with statuses r.ok return parts of memory instead of user's photo.
      // These parts of memory often represent parts of JWT tokens. This is not clear why they appear in results; skip them.
      const b64 =
        imageUrl && !imageUrl.startsWith("/9j/4AAQSk") ? undefined : imageUrl;
      if (typeof callback === "function") {
        callback(b64);
      }
      return b64;
    })
    .catch(() => undefined);
};

export const getPhotoUncached = async (
  userId: string
): Promise<string | undefined> => {
  const session = await auth();
  if (!session) return undefined;

  return fetchUserPhotoFromMsGraph(userId, session?.user.accessToken);
};

export const refreshDatabaseCache = (userId: string) => {
  auth().then((session) => {
    if (!session) return;
    const modified = new Date();
    fetchUserPhotoFromMsGraph(
      userId,
      session?.user.accessToken,
      (imageUrl: string | undefined) => {
        addUserPhotoToDatabase(userId, imageUrl, modified);
      }
    );
  });
};
