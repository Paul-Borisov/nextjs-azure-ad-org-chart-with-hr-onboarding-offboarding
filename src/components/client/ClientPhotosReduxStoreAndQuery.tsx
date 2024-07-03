"use client";

import { AppDispatch, RootState } from "@/store/store";
import { setDataSync } from "@/store/features/users/sliceUserPhotos";
import { useDispatch, useSelector } from "react-redux";
import { useLoadUserPhotosQuery } from "@/store/features/users/sliceUserPhotos.api";

const ClientPhotosReduxStoreAndQuery = () => {
  // This provides better performance if compared with calling the same hook within Photo.tsx
  const { data: userPhotos } = useLoadUserPhotosQuery();
  const dispatch = useDispatch<AppDispatch>();
  const data = useSelector((state: RootState) => state.userPhotos.photos);

  const saveToState = () => {
    const queryResultsCount = userPhotos ? Object.keys(userPhotos).length : 0;
    if (!queryResultsCount) return;
    const stateResultsCount = Object.keys(data).length;
    if (queryResultsCount !== stateResultsCount) {
      queueMicrotask(() => {
        dispatch(setDataSync({ payload: userPhotos, type: "" }));
      });
    }
  };
  saveToState();

  return null;
};

export default ClientPhotosReduxStoreAndQuery;
