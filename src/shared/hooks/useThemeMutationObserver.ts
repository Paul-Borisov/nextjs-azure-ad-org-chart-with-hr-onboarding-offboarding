import Utils from "../lib/utils";
import { useMemo, useState } from "react";

const useThemeMutationObserver = () => {
  const [isDarkMode, setIsDarkMode] = useState(Utils.isDarkMode());

  useMemo(() => {
    const observer = Utils.addMutationObserver(() =>
      setIsDarkMode(Utils.isDarkMode())
    );
    return () => observer.disconnect();
  }, []);

  return isDarkMode;
};
export default useThemeMutationObserver;
