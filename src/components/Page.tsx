import Toolbar from './Toolbar';
import GreetingCard from './GreetingCard';
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import './Page.scss';


function Page() {
  const theme = useContext(ThemeContext);

  return (
    <div className={`page ${theme}`}>
      <Toolbar />
      <div className="page-content">
        <GreetingCard />
      </div>
    </div>
  );
}

export default Page;