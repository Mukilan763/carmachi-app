import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { getTheme } from './utils/themeStore';

document.documentElement.setAttribute('data-theme', getTheme());

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
