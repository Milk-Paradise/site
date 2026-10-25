'use client';

import { useSyncExternalStore } from 'react';
import { themeStorageKey } from '@/config/theme';

export type Theme = 'pop' | 'dark';
const themeEvent = 'milkshake:theme';

function snapshot(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'pop';
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === themeStorageKey) {
      document.documentElement.dataset.theme = event.newValue === 'dark' ? 'dark' : 'pop';
      listener();
    }
  };
  window.addEventListener(themeEvent, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(themeEvent, listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(themeStorageKey, theme); } catch { /* Switching still works without storage. */ }
  window.dispatchEvent(new Event(themeEvent));
}

export function useTheme() {
  return useSyncExternalStore(subscribe, snapshot, () => 'pop' as Theme);
}
