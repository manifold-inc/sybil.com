import { useCallback, useEffect } from "react";

const ignoreKeybinds = ["INPUT", "TEXTAREA"] as (string | undefined)[];
export const useKeyDown = (callback: () => void, keys: string[]) => {
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const wasAnyKeyPressed = keys.some((key) => event.key === key);
      if (
        wasAnyKeyPressed &&
        !ignoreKeybinds.includes(document.activeElement?.tagName)
      ) {
        event.preventDefault();
        callback();
      }
    },
    [callback, keys]
  );
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
};
