import './Greeting.scss';

interface GreetingProps {
  theme: 'light' | 'dark';
}

function Greeting({ theme }: GreetingProps) {
  return (
    <h1 className={`greeting ${theme}`}>
      Hello, world!
    </h1>
  );
}

export default Greeting;
