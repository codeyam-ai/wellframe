import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// wellframe.css first (carries the ported globals top-matter), then styles.css
// so the app-shell baseline below wins over the light-mode body default.
import './wellframe.css';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
