// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize security services
import './services/securityInitializer';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);