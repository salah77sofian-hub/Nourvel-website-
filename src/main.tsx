import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import { ProductProvider } from './context/ProductContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <LanguageProvider>
        <ProductProvider>
          <App />
        </ProductProvider>
      </LanguageProvider>
    </HashRouter>
  </StrictMode>,
);
