import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import LanguageContext from '../contexts/LanguageContext';
import translations from '../translations';
import Greeting from './Greeting';
import './GreetingCard.scss';


function GreetingCard() {
  const theme = useContext(ThemeContext);
  const language = useContext(LanguageContext);
  return (
    <div className={`greeting-card ${theme}`}>
      <Greeting />
      <p className={`greeting-card-subtitle ${theme}`}>
        {translations[language].subtitle}
      </p>
    </div>
  );
}

export default GreetingCard;
