import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import './Toolbar.scss';
  

function Toolbar() {
  const theme = useContext(ThemeContext);
  return (
    <div className={`toolbar ${theme}`}>
      Current theme: <strong>{theme}</strong>
    </div>
  );
}

export default Toolbar;
