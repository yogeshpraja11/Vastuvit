import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Lenis' own stylesheet first, so anything in index.css still wins over it.
import 'lenis/dist/lenis.css';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
