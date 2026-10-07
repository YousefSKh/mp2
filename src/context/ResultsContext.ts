import { createContext, useContext } from 'react';
import type { NasaItem } from '../types/nasa.ts';

export interface ResultsState {
  items: NasaItem[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  // Ordered ids of whatever list/gallery the user last saw (for prev/next)
  navIds: string[];
  setNavIds: (ids: string[]) => void;
}

export const ResultsContext = createContext<ResultsState | null>(null);

export function useResults(): ResultsState {
  const ctx = useContext(ResultsContext);
  if (!ctx) throw new Error('useResults must be used inside ResultsProvider');
  return ctx;
}