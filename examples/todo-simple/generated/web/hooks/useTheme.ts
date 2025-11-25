// This file is not strictly needed as `next-themes` provides `useTheme` directly.
// It's included here for completeness if a custom hook wrapper was desired.
// For this project, `next-themes/useTheme` is used directly in ThemeToggle.tsx.
// If you wanted to add custom logic or context, this would be the place.

// Example of a custom wrapper (not used in this project directly, but shows the pattern):
/*
import { useTheme as useNextTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  useEffect(() => setMounted(true), []);

  return {
    theme,
    setTheme,
    resolvedTheme,
    mounted,
    isDarkMode: mounted && (theme === 'dark' || resolvedTheme === 'dark'),
  };
};
*/
