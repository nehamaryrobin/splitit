import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('splitit_theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('splitit_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('splitit_theme', 'light');
    }
  }, [dark]);

  return [dark, () => setDark(d => !d)];
}
