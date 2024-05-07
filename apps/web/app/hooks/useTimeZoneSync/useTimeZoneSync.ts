import { useLocation } from '@remix-run/react';
import { isbot } from 'isbot';
import { useEffect } from 'react';

export function useTimeZoneSync() {
  const location = useLocation();

  useEffect(() => {
    if (isbot(navigator.userAgent)) return;

    const regexp = new RegExp('(^| )timeZone=([^;]+)');
    const cookietimeZone = (document.cookie.match(regexp) || [])[2];
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (cookietimeZone !== `${timeZone}`) {
      document.cookie = `timeZone=${timeZone}; path=/; max-age=31536000`;
      window.location.reload();
    }
  }, [location.key]);
}
