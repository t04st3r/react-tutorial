import useLanguage from '../contexts/useLanguage';
import useTheme from '../contexts/useTheme';
import translations from '../translations';
import './Greeting.scss';


function Greeting() {
  const theme = useTheme();
  const language = useLanguage();
  return (
    <h1 className={`greeting ${theme}`}>
      {translations[language].greeting}
    </h1>
  );
}

export default Greeting;
