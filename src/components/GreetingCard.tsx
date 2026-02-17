import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import Greeting from './Greeting';
import './GreetingCard.scss';


function GreetingCard() {
  const theme = useContext(ThemeContext);
  return (
    <div className={`greeting-card ${theme}`}>
      <Greeting theme={theme} />
      <p className={`greeting-card-subtitle ${theme}`}>
        Welcome to the Context API tutorial
      </p>
    </div>
  );
}

export default GreetingCard;
