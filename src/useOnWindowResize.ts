import { useLayoutEffect } from 'react';
export const useOnWindowResize = (callback: EventListener) => {
  useLayoutEffect(() => {
    window.addEventListener('resize', callback, { passive: true });
    return () => window.removeEventListener('resize', callback);
  }, [callback]);
};
