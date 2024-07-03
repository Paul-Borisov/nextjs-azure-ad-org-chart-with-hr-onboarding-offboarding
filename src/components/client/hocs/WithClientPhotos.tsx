"use client";

import ClientPhotosReduxStore from "../ClientPhotosReduxStore";
import ClientPhotosReduxStoreAndQuery from "../ClientPhotosReduxStoreAndQuery";
import ClientPhotosSessionStore from "../ClientPhotosSessionStore";
import { PhotoStores } from "@/components/enums/photoStores";

interface WithClientPhotosProps {
  store: PhotoStores;
}
const WithClientPhotos = ({ store }: WithClientPhotosProps) => {
  switch (store) {
    case PhotoStores.redux:
      return <ClientPhotosReduxStore />;
    case PhotoStores.reduxWithQuery:
      return <ClientPhotosReduxStoreAndQuery />;
    default:
      return <ClientPhotosSessionStore />;
  }
};

export default WithClientPhotos;
