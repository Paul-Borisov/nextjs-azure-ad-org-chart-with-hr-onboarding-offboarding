import { createContext } from "react";
import { ISearchContext } from "@/components/contexts/iSearchContext";

export const SearchContext = createContext<ISearchContext>({
  searchText: "",
});
