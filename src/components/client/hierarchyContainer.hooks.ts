"use client";

import SearchUtils from "@/shared/lib/searchUtils";
import { useEffect, useState } from "react";
import Utils from "@/shared/lib/utils";
import { IUser } from "@/shared/interfaces/iUser";

export const useHierarchy = (
  data: IUser[] | undefined
): [
  newData: IUser[] | undefined,
  searchId: string | undefined,
  searchText: string | undefined
] => {
  const [searchText, setSearchText] = useState("");
  const searchId = searchText
    ? SearchUtils.getSearchIdFromSearchText()
    : undefined;

  useEffect(() => {
    const observer = Utils.addMutationObserverForSearchText(() => {
      const newValue = SearchUtils.getSearchText();
      setSearchText(newValue || "");
      if (searchId) {
        setTimeout(() => {
          const firstFound = document.getElementById(searchId);
          if (firstFound) {
            window.scrollTo({
              top: firstFound.getBoundingClientRect().top + window.scrollY,
              behavior: "smooth",
            });
          }
        }, 20);
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const newData = searchText
    ? data?.filter(
        (user) =>
          user.displayName
            ?.toLocaleLowerCase()
            .indexOf(searchText.toLocaleLowerCase()) > -1
      )
    : data;

  return [newData, searchId, searchText];
};
