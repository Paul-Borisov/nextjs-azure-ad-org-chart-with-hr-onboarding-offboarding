import { getPhotoUncached } from "@/actions/users.photo";
import { HierarchyContext } from "@/components/contexts/hierarchyContext";
import { IUser } from "@/shared/interfaces/iUser";
import {
  ForwardedRef,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import { RefObject } from "@fluentui/react";

export const usePhoto = (
  user: IUser,
  loadPhoto?: boolean,
  existingRefPhoto?: ForwardedRef<HTMLImageElement>
) => {
  const [imageUrl, setImageUrl] = useState<string>();
  const { renderUserPhotoOnClient, cacheUseDatabase } =
    useContext(HierarchyContext);
  const [, startTransition] = useTransition();
  useEffect(() => {
    const loadPhotoFromGraph = async () =>
      getPhotoUncached(user.id)
        .then((b64) => startTransition(() => setImageUrl(b64)))
        .catch((e) => console.log(e));
    const loadPhotoFromDatabase = async () =>
      fetch(`${window.origin}/api/dbphoto/${user.id}`)
        .then((r) => r.text())
        .then((b64) => {
          if (b64) {
            // If there are multiple ongoing Transitions, React currently batches them together.
            //startTransition(() => setImageUrl(b64 as string));
            setImageUrl(b64 as string);
          } else {
            loadPhotoFromGraph();
          }
        })
        .catch((e) => console.log(e));
    // Straight way
    //const src = document.querySelector<HTMLImageElement>(
    //  `img[alt="${user.displayName}"]`
    //)?.src;
    //if (src) {
    //  setImageUrl(src.substring(src.indexOf(",") + 1));
    // React way
    const existingImageRef = existingRefPhoto as RefObject<HTMLImageElement>;
    if (existingImageRef?.current?.currentSrc) {
      startTransition(() =>
        setImageUrl(
          existingImageRef?.current?.currentSrc.substring(
            existingImageRef.current.currentSrc.indexOf(",") + 1
          )
        )
      );
    } else if (renderUserPhotoOnClient || loadPhoto) {
      if (!cacheUseDatabase) {
        loadPhotoFromGraph();
      } else {
        if (loadPhoto) {
          loadPhotoFromDatabase();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    renderUserPhotoOnClient,
    user.id,
    loadPhoto,
    cacheUseDatabase,
    existingRefPhoto,
  ]);

  const imageSource = imageUrl || user.photo;

  return imageSource;
};
