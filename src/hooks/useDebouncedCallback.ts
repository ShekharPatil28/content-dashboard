import { useCallback, useEffect, useRef } from "react";

// Returns a function that waits `delay` ms after the last call before running `fn`
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delay = 400) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useRef(fn);

  useEffect(() => {
    latest.current = fn; // always call the newest version of fn
  });
  useEffect(() => () => clearTimeout(timer.current), []); // cancel on unmount

  return useCallback(
    (...args: A) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => latest.current(...args), delay);
    },
    [delay]
  );
}