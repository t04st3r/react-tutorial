import AppProviders from './contexts/AppProviders';
import Page from './components/Page';

function App() {
  return (
    <AppProviders>
      <Page />
    </AppProviders>
  );
}

export default App;