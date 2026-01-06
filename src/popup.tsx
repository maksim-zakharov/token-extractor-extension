import React from 'react';
import ReactDOM from 'react-dom/client';
import { TokenDisplay } from './components/TokenDisplay';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TokenDisplay />
  </React.StrictMode>
);

