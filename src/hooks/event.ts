/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect } from "react";

export type CustomGlobalEvent = {
  type: "page-already-loaded";
};

export function useCustomEvent<
  T extends CustomGlobalEvent["type"],
  U extends Extract<CustomGlobalEvent, { type: T }>,
>(type: T, onEvent?: (event: U) => void) {
  useEffect(() => {
    const onDocumentEvent = (evt: CustomEvent) => {
      onEvent?.(evt.detail as U);
    };
    document.addEventListener(type, onDocumentEvent as any);

    return () => {
      document.removeEventListener(type, onDocumentEvent as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEvent]);
}

export function emitCustomEvent(event: CustomGlobalEvent) {
  const customEvent = new CustomEvent(event.type, {
    detail: event,
  });
  document.dispatchEvent(customEvent);
}
