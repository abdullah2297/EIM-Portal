'use client';

import { useThemeMode } from '@/context/ThemeContext';
import { IconButton } from '@/components/ui/Button';

/** Header control that flips the portal between light and dark mode. */
export function ThemeToggle() {
  const { mode, toggleTheme, mounted } = useThemeMode();

  // Before hydration the real mode is unknown, so render a stable placeholder
  // to avoid a server/client markup mismatch.
  const icon = mounted && mode === 'dark' ? 'LightMode' : 'DarkMode';
  const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return <IconButton icon={icon} label={label} onClick={toggleTheme} />;
}

export default ThemeToggle;
