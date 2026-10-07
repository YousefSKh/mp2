import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { loadCollection } from '../api/nasa';
import type { NasaItem } from '../types/nasa';
import { ResultsContext } from './ResultsContext';

export default function ResultsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NasaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navIds, setNavIds] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadCollection()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not reach the NASA image library. Check your connection and try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setAttempt((a) => a + 1);
  }, []);

  const value = useMemo(
    () => ({ items, loading, error, reload, navIds, setNavIds }),
    [items, loading, error, reload, navIds]
  );

  return <ResultsContext.Provider value={value}>{children}</ResultsContext.Provider>;
}
