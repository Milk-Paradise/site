'use client';

import { setTheme, useTheme } from '@/lib/theme';

export function ThemeSwitcher() {
  const theme = useTheme();
  return <div className="theme-switcher" role="group" aria-label="Дизайн сайта">
    <button type="button" aria-pressed={theme === 'pop'} onClick={() => setTheme('pop')}>
      <span className="theme-icon" aria-hidden="true">✳</span> POP
    </button>
    <button type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
      <svg className="theme-moon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.5 9.1A5.7 5.7 0 0 1 6.9 2.5a5.8 5.8 0 1 0 6.6 6.6Z" stroke="currentColor" strokeWidth="1.3"/></svg> AFTER DARK
    </button>
  </div>;
}
