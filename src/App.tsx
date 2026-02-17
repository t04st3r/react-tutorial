import Page from './components/Page';
import ThemeContext from './contexts/ThemeContext';

function App() {
  return (
    <ThemeContext value="dark">
      <Page />
    </ThemeContext>
  );
}

export default App;