import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { UserPhotos } from "@/store/features/users/sliceUserPhotos";

export const apiUserPhotos = createApi({
  reducerPath: "api/loadUserPhotos",
  baseQuery: fetchBaseQuery({
    baseUrl: window.origin,
  }),
  endpoints: (build) => ({
    loadUserPhotos: build.query<UserPhotos, void>({
      query: () => ({
        url: "api/dbphoto",
      }),
    }),
  }),
});

export const { useLoadUserPhotosQuery } = apiUserPhotos;
