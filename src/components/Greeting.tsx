import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import LanguageContext from '../contexts/LanguageContext';
import translations from '../translations';
import './Greeting.scss';


function Greeting() {
  const theme = useContext(ThemeContext);
  const language = useContext(LanguageContext);
  return (
    <h1 className={`greeting ${theme}`}>
      {translations[language].greeting}
    </h1>
  );
}

export default Greeting;
