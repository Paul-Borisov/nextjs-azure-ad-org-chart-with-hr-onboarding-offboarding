"use client";

import { QueryClient, useQuery } from "@tanstack/react-query";

const photosCached = "photosCached";
const queryClient = new QueryClient();

const loadPhotosFromDatabase = async () =>
  fetch(`${window.origin}/api/dbphoto`)
    .then((r) => r.json())
    .catch((e) => console.log(e));

const ensurePhotos = () => {
  loadPhotosFromDatabase().then((photos: { [id: string]: string }) => {
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

const ClientPhotos = () => {
  useQuery(
    {
      queryKey: ["photosCached"],
      queryFn: ensurePhotos,
    },
    queryClient // There is no need to use a separate parant provider. This is possible to use queryClient by passing its direct reference.
  );

  return null;
};

export default ClientPhotos;
