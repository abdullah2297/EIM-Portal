'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { buildMuiTheme } from '@/theme/muiTheme';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * @typedef {'light' | 'dark'} ThemeMode
 * @typedef {{ mode: ThemeMode, toggleTheme: () => void, setMode: (m: ThemeMode) => void }} ThemeContextValue
 */

/** @type {import('react').Context<ThemeContextValue>} */
const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
  setMode: () => {},
});

/** Reads the mode already applied to <html> by the no-flash bootstrap script. */
function readInitialMode() {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Owns the light/dark mode for both the SCSS layer (via the `.dark` class on
 * <html>) and MUI (via a rebuilt theme object).
 */
export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setModeState(readInitialMode());
    setMounted(true);
  }, []);

  const setMode = useCallback((next) => {
    setModeState(next);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next === 'dark');
      document.documentElement.dataset.theme = next;
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, next);
    } catch {
      /* Storage can be unavailable (private mode) - theme still applies for this session. */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const muiTheme = useMemo(() => buildMuiTheme(mode), [mode]);

  const value = useMemo(
    () => ({ mode, toggleTheme, setMode, mounted }),
    [mode, toggleTheme, setMode, mounted],
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

/** @returns {ThemeContextValue & { mounted: boolean }} */
export function useThemeMode() {
  return useContext(ThemeContext);
}

export default ThemeContext;
