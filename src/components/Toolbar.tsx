import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import LanguageContext from '../contexts/LanguageContext';
import translations from '../translations';
import type { Language } from '../contexts/LanguageContext';
import './Toolbar.scss';

interface ToolbarProps {
  onToggleTheme: () => void;
  onChangeLanguage: (lang: Language) => void;
}

function Toolbar({ onToggleTheme, onChangeLanguage }: ToolbarProps) {
  const theme = useContext(ThemeContext);
  const language = useContext(LanguageContext);
  const languages: Language[] = ['en', 'it', 'es'];

  return (
    <div className={`toolbar ${theme}`}>
      <div className="toolbar-languages">
        {languages.map(lang => (
          <button
            key={lang}
            onClick={() => onChangeLanguage(lang)}
            className={`toolbar-lang-button ${lang === language ? 'active' : `inactive ${theme}`}`}
          >
            {translations[lang].language}
          </button>
        ))}
      </div>
      <button
        onClick={onToggleTheme}
        className={`toolbar-toggle ${theme}`}
      >
        Switch to {theme === 'dark' ? 'light' : 'dark'}
      </button>
    </div>
  );
}

export default Toolbar;