import Toolbar from './Toolbar';
import GreetingCard from './GreetingCard';
import './Page.scss';

interface PageProps {
  theme: 'light' | 'dark';
}

function Page({ theme }: PageProps) {
  return (
    <div className={`page ${theme}`}>
      <Toolbar theme={theme} />
      <div className="page-content">
        <GreetingCard theme={theme} />
      </div>
    </div>
  );
}

export default Page;
