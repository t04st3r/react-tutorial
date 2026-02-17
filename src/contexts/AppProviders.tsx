import { useState } from 'react';
import ThemeContext from './ThemeContext';
import LanguageContext from './LanguageContext';
import type { Language } from './LanguageContext';
import { createContext } from 'react';

// A new context for the actions (toggle theme, change language)
interface AppActions {
  toggleTheme: () => void;
  changeLanguage: (lang: Language) => void;
}

const AppActionsContext = createContext<AppActions>({
  toggleTheme: () => {},
  changeLanguage: () => {},
});

interface AppProvidersProps {
  children: React.ReactNode;
}

function AppProviders({ children }: AppProvidersProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<Language>('en');

  const actions: AppActions = {
    toggleTheme: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark'),
    changeLanguage: (lang: Language) => setLanguage(lang),
  };

  return (
    <ThemeContext value={theme}>
      <LanguageContext value={language}>
        <AppActionsContext value={actions}>
          {children}
        </AppActionsContext>
      </LanguageContext>
    </ThemeContext>
  );
}

export default AppProviders;
export { AppActionsContext };