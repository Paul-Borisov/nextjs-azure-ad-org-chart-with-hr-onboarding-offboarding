import { useRef, useEffect } from "react";

export const useDebounced = <Function extends (...args: any[]) => void>(
  func: Function,
  delayMs = 500
) => {
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (!timer.current) return;
      clearTimeout(timer.current);
    };
  }, []);

  const debounced = ((...args) => {
    const newTimer = setTimeout(() => {
      func(...args);
    }, delayMs);
    clearTimeout(timer.current);
    timer.current = newTimer;
  }) as Function;

  return debounced;
};
