import Toolbar from './Toolbar';
import GreetingCard from './GreetingCard';
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import type { Language } from '../contexts/LanguageContext';
import './Page.scss';

interface PageProps {
  onToggleTheme: () => void;
  onChangeLanguage: (lang: Language) => void;
}

function Page({ onToggleTheme, onChangeLanguage }: PageProps) {
  const theme = useContext(ThemeContext);

  return (
    <div className={`page ${theme}`}>
      <Toolbar onToggleTheme={onToggleTheme} onChangeLanguage={onChangeLanguage} />
      <div className="page-content">
        <GreetingCard />
      </div>
    </div>
  );
}

export default Page;