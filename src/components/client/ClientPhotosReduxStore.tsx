"use client";

import { AppDispatch } from "@/store/store";
import DbUtils from "@/shared/lib/dbUtils";
import { loadPhotosAsync } from "@/store/features/users/sliceUserPhotos";
import { useDispatch } from "react-redux";
//import { useEffect } from "react";

const ClientPhotosReduxStore = () => {
  const dispatch = useDispatch<AppDispatch>();
  // useEffect(() => {
  //   dispatch(loadPhotosAsync(DbUtils.loadPhotosFromDatabase));
  // }, [dispatch]);
  // This provides better performance of loading photos.
  queueMicrotask(() =>
    dispatch(loadPhotosAsync(DbUtils.loadPhotosFromDatabase))
  );

  return null;
};

export default ClientPhotosReduxStore;
