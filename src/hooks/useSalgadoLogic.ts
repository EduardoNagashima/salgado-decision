import { useState, useEffect, useCallback } from 'react';
import { SalgadoServiceResult, calculateSalgadoChances } from '../services/salgadoService';

export function useSalgadoLogic(): SalgadoServiceResult & {
  refresh: () => Promise<void>;
} {
  const [state, setState] = useState<SalgadoServiceResult>({
    chances: 50,
    nextDate: new Date(),
    lastUpdated: new Date(),
    holidaysThisWeek: [],
    isLoading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await calculateSalgadoChances();
      setState(result);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}