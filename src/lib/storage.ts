import { initialAppState } from '../app/state';
import { storageKey } from './constants';
import type { AppState } from '../types/app';

export function loadState(): AppState | null {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...initialAppState,
      ...parsed,
      setup: {
        ...initialAppState.setup,
        ...parsed.setup
      }
    };
  } catch {
    return null;
  }
}

export function saveState(state: AppState) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}
