import { useEffect, useState } from 'react';

export function useWindowVisibility(timeoutDuration: number = 10000): boolean {
  const [windowVisible, setWindowVisible] = useState<boolean>(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setWindowVisible(true);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      } else {
        timeoutId = setTimeout(() => {
          setWindowVisible(false);
        }, timeoutDuration);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutDuration]);

  return windowVisible;
}
