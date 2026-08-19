'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';

/**
 * Single client boundary for every provider the app needs:
 * Emotion cache (so MUI styles stream correctly with the App Router),
 * the light/dark theme, and the toast channel.
 */
export function Providers({ children }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui', enableCssLayer: true }}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

export default Providers;
