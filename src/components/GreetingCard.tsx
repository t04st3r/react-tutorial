import useTheme from '../contexts/useTheme';
import useLanguage from '../contexts/useLanguage';
import translations from '../translations';
import Greeting from './Greeting';
import './GreetingCard.scss';


function GreetingCard() {
  const theme = useTheme();
  const language = useLanguage();
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
