import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

// Create root element for React
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);