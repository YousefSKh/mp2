import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'normalize.css';
import './styles/tokens.css';
import ResultsProvider from './context/ResultsProvider.tsx';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ResultsProvider>
        <App />
      </ResultsProvider>
    </BrowserRouter>
  </StrictMode>
);