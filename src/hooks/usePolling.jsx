import { useEffect, useRef, useCallback } from 'react';

const usePolling = (callback, interval = 30_000) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const getSettings = useCallback(() => {
    try {
      const autoRefresh     = JSON.parse(localStorage.getItem('autoRefresh')     ?? 'true');
      const refreshInterval = JSON.parse(localStorage.getItem('refreshInterval') ?? String(interval / 1000));
      const ms = Math.max(10, Number(refreshInterval)) * 1000;
      return { autoRefresh: Boolean(autoRefresh), ms };
    } catch {
      return { autoRefresh: true, ms: interval };
    }
  }, [interval]);

  const startTimer = useCallback((onTick) => {
    const { autoRefresh, ms } = getSettings();
    if (!autoRefresh) return null;
    return setInterval(onTick, ms);
  }, [getSettings]);

  useEffect(() => {
    savedCallback.current();

    let id = startTimer(() => savedCallback.current());

    // Re-configure when Settings saves new autoRefresh / refreshInterval values
    const onStorage = (e) => {
      if (e.key === 'autoRefresh' || e.key === 'refreshInterval') {
        clearInterval(id);
        id = startTimer(() => savedCallback.current());
      }
    };

    // "Refresh Now" button in Settings
    const onForce = () => savedCallback.current();

    window.addEventListener('storage',       onStorage);
    window.addEventListener('forceRefresh',  onForce);

    return () => {
      clearInterval(id);
      window.removeEventListener('storage',      onStorage);
      window.removeEventListener('forceRefresh', onForce);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default usePolling;