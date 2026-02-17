import './Toolbar.scss';

interface ToolbarProps {
  theme: 'light' | 'dark';
}

function Toolbar({ theme }: ToolbarProps) {
  return (
    <div className={`toolbar ${theme}`}>
      Current theme: <strong>{theme}</strong>
    </div>
  );
}

export default Toolbar;
