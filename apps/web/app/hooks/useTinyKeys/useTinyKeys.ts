import { useEffect } from 'react';
// import { tinykeys } from 'tinykeys';

export function useTinyKeys(keys: Record<string, () => void>) {
  useEffect(() => {
    // const unsubscribe = tinykeys(window, keys);
    // return () => {
    //   unsubscribe();
    // };
  }, [keys]);
}
