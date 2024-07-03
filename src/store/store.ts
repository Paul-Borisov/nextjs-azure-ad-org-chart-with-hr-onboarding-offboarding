import { apiUserPhotos } from "./features/users/sliceUserPhotos.api";
import { configureStore } from "@reduxjs/toolkit";
import sliceUserPhotos from "./features/users/sliceUserPhotos";

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export const store = configureStore({
  reducer: {
    userPhotos: sliceUserPhotos,
    [apiUserPhotos.reducerPath]: apiUserPhotos.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling, and other useful features of rtk-query.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiUserPhotos.middleware),
});
