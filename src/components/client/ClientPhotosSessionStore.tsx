"use client";

import dbUtils from "@/shared/lib/dbUtils";
import { QueryClient, useQuery } from "@tanstack/react-query";

const photosCached = "photosCached";
const queryClient = new QueryClient();

const ensurePhotos = () => {
  dbUtils.loadPhotosFromDatabase().then((photos: { [id: string]: string }) => {
    if (typeof photos === "undefined") return;
    const keys = Object.keys(photos);
    keys?.forEach((id) => {
      const photo = photos[id];
      if (photo) sessionStorage.setItem(id, photo);
    });
    if (keys?.length) sessionStorage.setItem(photosCached, "true");
  });
  return [];
};

const ClientPhotosSessionStore = () => {
  useQuery(
    {
      queryKey: [photosCached],
      queryFn: ensurePhotos,
    },
    queryClient // There is no need to use a separate root provider. This is possible to use queryClient by passing its direct reference.
  );

  return null;
};

export default ClientPhotosSessionStore;
