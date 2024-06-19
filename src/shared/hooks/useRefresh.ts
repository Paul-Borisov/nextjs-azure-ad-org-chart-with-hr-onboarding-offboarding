import { useState } from "react";

export const useRefresh = () => {
  const [_, force] = useState(false);
  return () => {
    setTimeout(() => force((prev) => !prev));
  };
};
