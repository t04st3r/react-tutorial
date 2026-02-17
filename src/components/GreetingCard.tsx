import Greeting from './Greeting';
import './GreetingCard.scss';

interface GreetingCardProps {
  theme: 'light' | 'dark';
}

function GreetingCard({ theme }: GreetingCardProps) {
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
