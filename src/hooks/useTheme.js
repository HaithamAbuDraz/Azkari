import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('azkar-theme');
    if (saved) return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('azkar-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    // Temporarily disable all CSS transitions to switch theme instantaneously without moving/morphing colors
    document.documentElement.classList.add('disable-transitions');

    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    // Force layout recalculation so the theme applies instantly with zero transition delay
    window.getComputedStyle(document.documentElement).opacity;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('disable-transitions');
      });
    });
  };

  return { theme, toggleTheme };
}
