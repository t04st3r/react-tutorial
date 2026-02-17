import useTheme from '../contexts/useTheme';
import useLanguage from '../contexts/useLanguage';
import useAppActions from '../contexts/useAppActions';
import translations from '../translations';
import type { Language } from '../contexts/LanguageContext';
import './Toolbar.scss';

function Toolbar() {
  const theme = useTheme();
  const language = useLanguage();
  const { changeLanguage, toggleTheme } = useAppActions();
  const languages: Language[] = ['en', 'it', 'es'];

  return (
    <div className={`toolbar ${theme}`}>
      <div className="toolbar-languages">
        {languages.map(lang => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`toolbar-lang-button ${lang === language ? 'active' : `inactive ${theme}`}`}
          >
            {translations[lang].language}
          </button>
        ))}
      </div>
      <button
        onClick={toggleTheme}
        className={`toolbar-toggle ${theme}`}
      >
        Switch to {theme === 'dark' ? 'light' : 'dark'}
      </button>
    </div>
  );
}

export default Toolbar;