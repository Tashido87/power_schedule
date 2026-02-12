import { useEffect, useState } from 'react';

export function useNowTicker(enabled = true): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let timeoutId = 0;
    let intervalId = 0;

    const tick = () => setNow(new Date());
    const msUntilNextSecond = 1000 - (Date.now() % 1000);

    timeoutId = window.setTimeout(() => {
      tick();
      intervalId = window.setInterval(tick, 1000);
    }, msUntilNextSecond);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [enabled]);

  return now;
}
