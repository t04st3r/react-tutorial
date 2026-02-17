import { useState } from 'react';
import Page from './components/Page';
import ThemeContext from './contexts/ThemeContext';
import LanguageContext from './contexts/LanguageContext';
import type { Language } from './contexts/LanguageContext';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<Language>('en');

  function toggleTheme() {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }

  return (
    <ThemeContext value={theme}>
      <LanguageContext value={language}>
        <Page onToggleTheme={toggleTheme} onChangeLanguage={setLanguage} />
      </LanguageContext>
    </ThemeContext>
  );
}

export default App;