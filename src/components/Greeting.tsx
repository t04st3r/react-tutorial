import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import './Greeting.scss';


function Greeting() {
  const theme = useContext(ThemeContext);
  return (
    <h1 className={`greeting ${theme}`}>
      Hello, world!
    </h1>
  );
}

export default Greeting;
