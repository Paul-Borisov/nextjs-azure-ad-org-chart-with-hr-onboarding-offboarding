import { createContext } from "react";
import { IClientGlobalContext } from "./iClientGlobalContext";

export const ClientGlobalContext = createContext<IClientGlobalContext>({
  shouldUseMockupDataWhenUnauthenticated: false,
});
