import { useLayoutEffect, useState } from "react";

export const useClientDimensions = (): [number, number] => {
  const [clientWidth, setClientWidth] = useState<number>(
    document?.body?.clientWidth
  );
  const [clientHeight, setClientHeight] = useState<number>(
    document?.body?.clientHeight
  );

  useLayoutEffect(() => {
    const resize = () => {
      setClientWidth(document?.body?.clientWidth);
      setClientHeight(document?.body?.clientHeight);
    };
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);

  return [clientWidth ?? 0, clientHeight ?? 0];
};
