import { useCallback, useLayoutEffect, useState } from "react";

export const useClientDimensions = (): [number, number] => {
  const [clientWidth, setClientWidth] = useState<number>(
    document?.body?.clientWidth
  );
  const [clientHeight, setClientHeight] = useState<number>(
    document?.body?.clientHeight
  );
  const resize = useCallback(() => {
    setClientWidth(document?.body?.clientWidth);
    setClientHeight(document?.body?.clientHeight);
  }, []);

  useLayoutEffect(() => {
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  return [clientWidth ?? 0, clientHeight ?? 0];
};
