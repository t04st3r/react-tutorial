import Toolbar from './Toolbar';
import GreetingCard from './GreetingCard';
import ThemeContext from '../contexts/ThemeContext';
import useTheme from '../contexts/useTheme';
import './Page.scss';


function Page() {
  const theme = useTheme();

  return (
    <div className={`page ${theme}`}>
      <Toolbar />
      <div className="page-content">
        <ThemeContext value="dark">
          <GreetingCard />
        </ThemeContext>
      </div>
    </div>
  );
}

export default Page;