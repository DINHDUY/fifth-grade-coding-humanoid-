import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_STATE, loadState, saveState } from '../application/progress';
import type { AppState } from '../domain/types';

export function useAppState(): [AppState, (next: AppState) => void] {
  const [state, setState] = useState<AppState>(() => loadState(window.localStorage));
  const update = useCallback((next: AppState) => { setState(next); saveState(window.localStorage, next); }, []);
  useEffect(() => saveState(window.localStorage, state), [state]);
  return [state, update];
}

export const useCompleted = (state: AppState, update: (next: AppState) => void) => {
  const completed = useMemo(() => new Set(state.completed), [state.completed]);
  const toggle = useCallback((key: string) => update({ ...state, completed: completed.has(key) ? state.completed.filter((item) => item !== key) : [...state.completed, key] }), [completed, state, update]);
  return { completed, toggle };
};

export const resetState = (update: (next: AppState) => void) => update(DEFAULT_STATE);
