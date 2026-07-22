import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ThemeMode = 'light' | 'dark';

type ThemeContextData = {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = 'wodful-chrome-theme';

const ThemeContext = createContext({} as ThemeContextData);

function readStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('wodful-theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    /* ignore */
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => readStoredTheme());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
      // Clear legacy global dark class if present
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context?.setTheme) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
