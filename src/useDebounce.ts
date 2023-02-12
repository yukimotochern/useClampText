import type { DebouncedFunc, DebounceSettings } from 'lodash';
import { debounce } from 'lodash';
import { useRef, useEffect, useCallback } from 'react';

/**
 * Enhanced debounce hook, from https://github.com/imbhargav5/rooks/blob/main/src/hooks/useDebounce.ts
 * @param callback The callback function to debounce
 * @param wait The duration to debounce in milisecond
 * @param options DebounceSettings from lodash
 * @returns Returns the debounced function.
 */

export const useDebounce = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  wait?: number,
  options?: DebounceSettings,
) => {
  const createDebouncedCallback = useCallback(
    (cb: T): DebouncedFunc<T> => {
      return debounce(cb, wait, options);
    },
    [wait, options],
  );

  const debouncedCallbackRef = useRef<DebouncedFunc<T>>(createDebouncedCallback(callback));

  useEffect(() => {
    debouncedCallbackRef.current = createDebouncedCallback(callback);
    return () => debouncedCallbackRef.current.cancel();
  }, [callback, createDebouncedCallback]);

  return debouncedCallbackRef.current;
};
